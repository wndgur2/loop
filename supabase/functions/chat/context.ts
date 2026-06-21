import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Loopie context = the user's **full feedback + sub-goals** (loopie-spec §5).
 * Queried via the RLS client, so only the user's own data is returned.
 * The returned string is injected as a cached block in the system prompt (prompt caching).
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
        takeaways ? `takeaways:\n${takeaways}` : 'takeaways: (none)',
      ].join('\n');
    })
    .join('\n\n');

  return [
    "## User's sub-goals (= category candidates, assign exactly one of these)",
    subGoalLines || '(none yet)',
    '',
    "## User's full feedback (basis for repetition detection & revisiting)",
    feedbackBlocks || '(none yet)',
  ].join('\n');
}
