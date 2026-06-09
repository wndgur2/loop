import { useMemo } from 'react';

import { useSubGoals } from './queries';

/** Sub-goal id → name resolver ('—' when unknown). Stable while the sub-goal list is unchanged. */
export function useSubGoalName(): (id: string) => string {
  const { data: subGoals = [] } = useSubGoals();
  return useMemo(() => {
    const map = new Map(subGoals.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [subGoals]);
}
