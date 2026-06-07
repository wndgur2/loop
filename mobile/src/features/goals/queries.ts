/**
 * 최종 목표(goals) · 하위 목표(sub_goals) 데이터 훅.
 * MVP는 활성 목표 1개. sub_goals는 RLS가 사용자 소유 목표로 스코프하므로 전체 select로 충분.
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

/** 온보딩: 최종 목표 1개 + 하위목표 다중을 한 번에 생성. */
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
      // 연결 피드백이 있으면 DB가 restrict로 막는다(data-model). 에러를 그대로 올린다.
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
