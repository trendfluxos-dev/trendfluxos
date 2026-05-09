import { QueryClient } from "@tanstack/react-query";

/**
 * Optimized React Query client with production-ready defaults
 * - Improved caching strategy
 * - Automatic refetch on reconnect
 * - Optimized garbage collection
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes before re-fetching
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes even if it's stale
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch when window is focused (reduce server load)
      refetchOnWindowFocus: false,
      // Refetch when user reconnects to internet
      refetchOnReconnect: true,
      // Refetch when tab becomes visible
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
