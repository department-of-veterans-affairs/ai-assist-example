import { useUpdatePatient } from '@department-of-veterans-affairs/cds-patient-context-lib';
import type { ReactNode } from 'react';
import { usePatientFromFhir } from '@/hooks/use-patient-from-fhir';
import { getEnvVar } from '@/utils/helpers';

interface SmartLaunchProviderProps {
  children: ReactNode;
}

export function SmartLaunchProvider({ children }: SmartLaunchProviderProps) {
  // Initialize CDS Patient Context Library for bidirectional updates
  const smartContainerUrl = getEnvVar('VITE_SMART_CONTAINER_URL');
  useUpdatePatient(smartContainerUrl);

  // Load patient data if we have a FHIR client
  usePatientFromFhir();

  return <>{children}</>;
}
