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
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

