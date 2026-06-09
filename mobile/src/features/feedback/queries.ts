/**
 * Data hooks for feedbacks + takeaways.
 * Create (shared by direct form and AI proposal), read, internalize/done toggles, update, delete.
 */
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { qk } from '@/lib/query-keys';
import { getSupabase, requireUserId } from '@/lib/supabase';
import {
  type Feedback,
  type FeedbackWithTakeaways,
  type Importance,
  toFeedbackWithTakeaways,
} from '@/types/models';

const SELECT_WITH_TAKEAWAYS =
  '*, takeaways(id, feedback_id, text, done, done_at, sort_order, created_at)';

/** Refresh both the list and the single-feedback cache after a mutation. */
function invalidateFeedback(qc: QueryClient, feedbackId: string) {
  qc.invalidateQueries({ queryKey: qk.feedbacks });
  qc.invalidateQueries({ queryKey: qk.feedback(feedbackId) });
}

export interface FeedbackInput {
  title: string;
  situation: string;
  rootCause: string;
  subGoalId: string;
  importance: Importance;
  tags: string[];
  takeaways: string[];
  sessionId?: string | null;
}

export function useFeedbacks() {
  return useQuery<FeedbackWithTakeaways[]>({
    queryKey: qk.feedbacks,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('feedbacks')
        .select(SELECT_WITH_TAKEAWAYS)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toFeedbackWithTakeaways);
    },
  });
}

export function useFeedback(id: string | undefined) {
  return useQuery<FeedbackWithTakeaways | null>({
    queryKey: id ? qk.feedback(id) : ['feedback', 'none'],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('feedbacks')
        .select(SELECT_WITH_TAKEAWAYS)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data ? toFeedbackWithTakeaways(data) : null;
    },
  });
}

export function useCreateFeedback() {
  const qc = useQueryClient();
  return useMutation<Feedback, Error, FeedbackInput>({
    mutationFn: async (input) => {
      const supabase = getSupabase();
      const userId = await requireUserId();
      const { data: fb, error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: userId,
          session_id: input.sessionId ?? null,
          title: input.title.trim(),
          situation: input.situation.trim(),
          root_cause: input.rootCause.trim(),
          sub_goal_id: input.subGoalId,
          importance: input.importance,
          tags: input.tags,
        })
        .select()
        .single();
      if (error) throw error;

      const items = input.takeaways.map((t) => t.trim()).filter(Boolean);
      if (items.length > 0) {
        const rows = items.map((text, i) => ({ feedback_id: fb.id, text, sort_order: i }));
        const { error: tErr } = await supabase.from('takeaways').insert(rows);
        if (tErr) throw tErr;
      }
      return toFeedbackWithTakeaways(fb);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.feedbacks }),
  });
}

export function useUpdateFeedback() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string } & FeedbackInput>({
    mutationFn: async (input) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('feedbacks')
        .update({
          title: input.title.trim(),
          situation: input.situation.trim(),
          root_cause: input.rootCause.trim(),
          sub_goal_id: input.subGoalId,
          importance: input.importance,
          tags: input.tags,
        })
        .eq('id', input.id);
      if (error) throw error;

      // takeaways are synced simply: delete existing then re-insert (sufficient at MVP scale).
      await supabase.from('takeaways').delete().eq('feedback_id', input.id);
      const items = input.takeaways.map((t) => t.trim()).filter(Boolean);
      if (items.length > 0) {
        const rows = items.map((text, i) => ({ feedback_id: input.id, text, sort_order: i }));
        const { error: tErr } = await supabase.from('takeaways').insert(rows);
        if (tErr) throw tErr;
      }
    },
    onSuccess: (_d, v) => invalidateFeedback(qc, v.id),
  });
}

export function useToggleTakeaway() {
  const qc = useQueryClient();
  return useMutation<void, Error, { feedbackId: string; takeawayId: string; done: boolean }>({
    mutationFn: async ({ takeawayId, done }) => {
      const { error } = await getSupabase()
        .from('takeaways')
        .update({ done, done_at: done ? new Date().toISOString() : null })
        .eq('id', takeawayId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => invalidateFeedback(qc, v.feedbackId),
  });
}

export function useSetInternalized() {
  const qc = useQueryClient();
  return useMutation<void, Error, { feedbackId: string; internalized: boolean }>({
    mutationFn: async ({ feedbackId, internalized }) => {
      const { error } = await getSupabase()
        .from('feedbacks')
        .update({ internalized, internalized_at: internalized ? new Date().toISOString() : null })
        .eq('id', feedbackId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => invalidateFeedback(qc, v.feedbackId),
  });
}

export function useDeleteFeedback() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      // takeaways are deleted together via ON DELETE CASCADE (migration).
      const { error } = await getSupabase().from('feedbacks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.feedbacks }),
  });
}
