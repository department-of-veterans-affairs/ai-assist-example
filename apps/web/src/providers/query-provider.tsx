import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set default stale time to 5 minutes for better UX
      staleTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
