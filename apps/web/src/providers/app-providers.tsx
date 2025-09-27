import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Central composition of all application providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
