import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const shouldRetry = (failureCount: number, error: unknown) => {
  if (failureCount >= 2) return false;

  if (error instanceof AxiosError) {
    const status = error.response?.status;

    // Authentication, validation and other client errors are not transient.
    if (status && status >= 400 && status < 500) return false;
  }

  return true;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 30 * 60_000,
      retry: shouldRetry,
      // A screen may have been changed by another user while this tab was
      // inactive. Refetch when the user returns instead of requiring F5.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

