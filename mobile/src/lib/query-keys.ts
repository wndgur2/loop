/** TanStack Query 키 — 한 곳에서 관리해 무효화 누락을 막는다. */
export const qk = {
  profile: ['profile'] as const,
  goal: ['goal'] as const,
  subGoals: ['subGoals'] as const,
  feedbacks: ['feedbacks'] as const,
  feedback: (id: string) => ['feedback', id] as const,
};
