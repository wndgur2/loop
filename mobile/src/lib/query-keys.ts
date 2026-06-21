/** TanStack Query keys — managed in one place to prevent missed invalidations. */
export const qk = {
  profile: ['profile'] as const,
  goal: ['goal'] as const,
  subGoals: ['subGoals'] as const,
  feedbacks: ['feedbacks'] as const,
  feedback: (id: string) => ['feedback', id] as const,
  subscription: ['subscription'] as const,
  usage: ['usage'] as const,
  proPackage: ['proPackage'] as const,
};
