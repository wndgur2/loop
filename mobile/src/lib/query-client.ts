import { QueryClient } from '@tanstack/react-query';

/**
 * 앱 전역 TanStack Query 클라이언트.
 * 서버 상태는 모두 Query로 관리한다(전역 상태 남발 금지 — CLAUDE.md §7).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});
