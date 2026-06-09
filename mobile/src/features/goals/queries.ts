/**
 * Data hooks for goals (final goals) and sub_goals.
 * MVP has 1 active goal. RLS scopes sub_goals to the user's own goals, so a full select is sufficient.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/lib/query-keys';
import { getSupabase } from '@/lib/supabase';
import { type Goal, type SubGoal, toGoal, toSubGoal } from '@/types/models';

export function useActiveGoal(enabled = true) {
  return useQuery<Goal | null>({
    queryKey: qk.goal,
    enabled,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? toGoal(data) : null;
    },
  });
}

export function useSubGoals() {
  return useQuery<SubGoal[]>({
    queryKey: qk.subGoals,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('sub_goals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toSubGoal);
    },
  });
}

/** Onboarding: create 1 final goal + multiple sub-goals at once. */
export function useCreateGoalWithSubGoals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      title: string;
      description?: string | null;
      subGoals: { name: string; source: 'ai_suggested' | 'user_added' }[];
    }) => {
      const supabase = getSupabase();
      const { data: goal, error: goalErr } = await supabase
        .from('goals')
        .insert({ user_id: input.userId, title: input.title.trim(), description: input.description ?? null })
        .select()
        .single();
      if (goalErr) throw goalErr;

      if (input.subGoals.length > 0) {
        const rows = input.subGoals.map((s, i) => ({
          goal_id: goal.id,
          name: s.name.trim(),
          source: s.source,
          sort_order: i,
        }));
        const { error: subErr } = await supabase.from('sub_goals').insert(rows);
        if (subErr) throw subErr;
      }
      return toGoal(goal);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goal });
      qc.invalidateQueries({ queryKey: qk.subGoals });
    },
  });
}

export function useAddSubGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { goalId: string; name: string; sortOrder: number }) => {
      const { error } = await getSupabase()
        .from('sub_goals')
        .insert({ goal_id: input.goalId, name: input.name.trim(), source: 'user_added', sort_order: input.sortOrder });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subGoals }),
  });
}

export function useDeleteSubGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // If linked feedbacks exist, the DB blocks it via restrict (data-model). Propagate the error as-is.
      const { error } = await getSupabase().from('sub_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subGoals }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title: string; description?: string | null }) => {
      const { error } = await getSupabase()
        .from('goals')
        .update({ title: input.title.trim(), description: input.description ?? null })
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goal }),
  });
}
