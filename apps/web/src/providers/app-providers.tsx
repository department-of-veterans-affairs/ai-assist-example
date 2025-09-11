import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { SmartLaunchProvider } from './smart-launch-provider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Central composition of all application providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <SmartLaunchProvider>{children}</SmartLaunchProvider>
    </QueryProvider>
  );
}
