import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide TanStack Query client.
 * All server state is managed with Query (avoid overusing global state — CLAUDE.md §7).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});
