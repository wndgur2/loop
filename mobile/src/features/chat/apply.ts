/**
 * 회고(retrospective) proposal을 DB에 반영한다 — 확인 칩을 누른 뒤에만 호출(조용한 변경 금지).
 * 작성(create) proposal은 useCreateFeedback 훅으로 컴포넌트에서 직접 반영한다.
 */
import type { RetrospectiveProposal } from '@/lib/loopi';
import { getSupabase } from '@/lib/supabase';

export async function applyRetrospective(proposal: RetrospectiveProposal): Promise<void> {
  const supabase = getSupabase();

  if (typeof proposal.internalized === 'boolean') {
    const { error } = await supabase
      .from('feedbacks')
      .update({
        internalized: proposal.internalized,
        internalized_at: proposal.internalized ? new Date().toISOString() : null,
      })
      .eq('id', proposal.feedback_id);
    if (error) throw error;
  }

  for (const u of proposal.takeaway_updates ?? []) {
    if (u.takeaway_id) {
      const patch: { text?: string; done?: boolean; done_at?: string | null } = {};
      if (u.text !== undefined) patch.text = u.text;
      if (u.done !== undefined) {
        patch.done = u.done;
        patch.done_at = u.done ? new Date().toISOString() : null;
      }
      if (Object.keys(patch).length) {
        const { error } = await supabase.from('takeaways').update(patch).eq('id', u.takeaway_id);
        if (error) throw error;
      }
    } else if (u.text) {
      // id 없음 → 신규 다짐 추가
      const { error } = await supabase
        .from('takeaways')
        .insert({ feedback_id: proposal.feedback_id, text: u.text, done: u.done ?? false });
      if (error) throw error;
    }
  }
}

/** 회고 변경 내용을 사람이 읽을 한국어 요약으로 — 확인 칩 위에 보여준다. */
export function describeRetrospective(p: RetrospectiveProposal): string[] {
  const lines: string[] = [];
  if (p.internalized === true) lines.push('이 피드백을 내재화 완료로 표시');
  if (p.internalized === false) lines.push('내재화 표시 해제');
  for (const u of p.takeaway_updates ?? []) {
    if (u.takeaway_id && u.done === true) lines.push('실천항목 하나를 실행 완료로');
    else if (u.takeaway_id && u.done === false) lines.push('실천항목 하나를 미실행으로');
    else if (u.takeaway_id && u.text) lines.push(`다짐을 다듬기: "${u.text}"`);
    else if (!u.takeaway_id && u.text) lines.push(`새 다짐 추가: "${u.text}"`);
  }
  return lines.length ? lines : ['변경할 내용이 없어요.'];
}
