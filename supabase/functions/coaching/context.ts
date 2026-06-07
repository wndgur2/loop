import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/**
 * 코칭 컨텍스트 = 사용자의 **전체 피드백 + 하위 목표**(ai-coaching-spec §5).
 * RLS 클라이언트로 조회하므로 자기 데이터만 나온다.
 * 반환 문자열은 시스템 프롬프트에 캐시되는 블록으로 주입한다(프롬프트 캐싱).
 */
export async function buildContext(supabase: SupabaseClient): Promise<string> {
  const [{ data: subGoals }, { data: feedbacks }] = await Promise.all([
    supabase.from('sub_goals').select('id, name').order('sort_order'),
    supabase
      .from('feedbacks')
      .select('id, title, situation, root_cause, importance, internalized, sub_goal_id, tags, takeaways(id, text, done)')
      .order('created_at', { ascending: false }),
  ]);

  const subGoalLines = (subGoals ?? [])
    .map((g) => `- ${g.name} (id: ${g.id})`)
    .join('\n');

  const feedbackBlocks = (feedbacks ?? [])
    .map((f) => {
      const takeaways = (f.takeaways ?? [])
        .map((t: { text: string; done: boolean }) => `  - [${t.done ? 'x' : ' '}] ${t.text}`)
        .join('\n');
      return [
        `### ${f.title} (id: ${f.id})`,
        `category(sub_goal_id): ${f.sub_goal_id} · importance: ${f.importance} · internalized: ${f.internalized}`,
        `situation: ${f.situation}`,
        `root_cause: ${f.root_cause}`,
        takeaways ? `takeaways:\n${takeaways}` : 'takeaways: (없음)',
      ].join('\n');
    })
    .join('\n\n');

  return [
    '## 사용자의 하위 목표 (= category 후보, 이 중 하나만 배정 가능)',
    subGoalLines || '(아직 없음)',
    '',
    '## 사용자의 전체 피드백 (반복 감지·되새김의 근거)',
    feedbackBlocks || '(아직 없음)',
  ].join('\n');
}
