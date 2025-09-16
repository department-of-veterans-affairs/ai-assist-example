import { useUpdatePatient } from '@department-of-veterans-affairs/cds-patient-context-lib';
import type { ReactNode } from 'react';
import { CONFIG } from '@/config';
import { usePatientFromFhir } from '@/hooks/use-patient-from-fhir';

interface SmartLaunchProviderProps {
  children: ReactNode;
}

export function SmartLaunchProvider({ children }: SmartLaunchProviderProps) {
  // Initialize CDS Patient Context Library for bidirectional updates
  const smartContainerUrl = CONFIG.smartOnFhirContainerUrl;
  useUpdatePatient(smartContainerUrl);

  // Load patient data if we have a FHIR client
  usePatientFromFhir();

  return <>{children}</>;
}
