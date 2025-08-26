import type { ReactNode } from 'react';
import { useSmartLaunch } from '@/hooks/use-smart-launch';

interface SmartLaunchProviderProps {
  children: ReactNode;
}

export function SmartLaunchProvider({ children }: SmartLaunchProviderProps) {
  const { loading, error } = useSmartLaunch();

  if (loading) {
    return (
      <div className="padding-3 text-center">
        <p>Initializing SMART on FHIR</p>
      </div>
    );
  }

  if (error && process.env.NODE_ENV === 'development') {
    // SMART launch error handled - continuing with app for local dev
    // biome-ignore lint/suspicious/noConsole: Intentional console.warn for debugging SMART launch errors in development
    console.warn(
      'SMART launch error:',
      error,
      '- continuing with app for local development'
    );
  }

  return <>{children}</>;
}
