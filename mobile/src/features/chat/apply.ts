/**
 * Applies a retrospective proposal to the DB — call only after the confirm chip is pressed (no silent changes).
 * Create proposals are applied directly in components via the useCreateFeedback hook.
 */
import type { RetrospectiveProposal } from '@/lib/loopi';
import { getSupabase } from '@/lib/supabase';
import type { TKey } from '@/lib/translations';

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
      // No id → add a new takeaway
      const { error } = await supabase
        .from('takeaways')
        .insert({ feedback_id: proposal.feedback_id, text: u.text, done: u.done ?? false });
      if (error) throw error;
    }
  }
}

/** Turn the retrospective changes into a human-readable summary — shown above the confirm chip (localized via t). */
export function describeRetrospective(
  p: RetrospectiveProposal,
  t: (key: TKey, vars?: Record<string, string | number>) => string,
): string[] {
  const lines: string[] = [];
  if (p.internalized === true) lines.push(t('retro.internalize'));
  if (p.internalized === false) lines.push(t('retro.deinternalize'));
  for (const u of p.takeaway_updates ?? []) {
    if (u.takeaway_id && u.done === true) lines.push(t('retro.takeawayDone'));
    else if (u.takeaway_id && u.done === false) lines.push(t('retro.takeawayUndone'));
    else if (u.takeaway_id && u.text) lines.push(t('retro.takeawayEdit', { text: u.text }));
    else if (!u.takeaway_id && u.text) lines.push(t('retro.takeawayAdd', { text: u.text }));
  }
  return lines.length ? lines : [t('retro.nochange')];
}
