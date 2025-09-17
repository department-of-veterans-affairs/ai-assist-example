import { useUpdatePatient } from '@department-of-veterans-affairs/cds-patient-context-lib';
import { type ReactNode, useEffect, useMemo } from 'react';
import { CONFIG } from '@/config';
import { usePatient } from '@/hooks/use-patient';
import { usePatientStore } from '@/stores/patient-store';

interface SmartLaunchProviderProps {
  children: ReactNode;
}

interface LaunchContext {
  patient: string; // ICN
  sta3n: string;
  duz: string;
}

function parseLaunchContext(): LaunchContext | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const launch = urlParams.get('launch');

    if (!launch) {
      return null;
    }

    const decoded = atob(launch);
    const parsed = JSON.parse(decoded);

    // Validate required fields
    if (parsed.patient && parsed.sta3n && parsed.duz) {
      return {
        patient: parsed.patient,
        sta3n: parsed.sta3n,
        duz: parsed.duz,
      };
    }
  } catch (error) {
    console.error('Failed to parse launch context:', error);
  }
  return null;
}

export function SmartLaunchProvider({ children }: SmartLaunchProviderProps) {
  // Initialize CDS Patient Context Library for bidirectional updates
  const smartContainerUrl = CONFIG.smartOnFhirContainerUrl;
  useUpdatePatient(smartContainerUrl);

  // Get launch context (ICN, station, DUZ)
  const launchContext = useMemo(() => parseLaunchContext(), []);

  // Get FHIR patient data
  const fhirPatient = usePatient();
  const setPatient = usePatientStore((state) => state.setPatient);

  // Set patient in store when FHIR data is loaded
  useEffect(() => {
    if (fhirPatient) {
      const firstName = fhirPatient.name?.[0]?.given?.join(' ') ?? '';
      const lastName = fhirPatient.name?.[0]?.family ?? '';

      setPatient({
        id: fhirPatient.id,
        icn: launchContext?.patient || fhirPatient.id, // Use ICN from launch if available
        dfn: fhirPatient.id,
        sta3n: launchContext?.sta3n, // Station from launch context
        duz: launchContext?.duz, // DUZ from launch context
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        description: '',
        keyConditions: [],
        ssn: '',
        dob: fhirPatient.birthDate || '',
        mrn: '',
      });
    }
  }, [fhirPatient, launchContext, setPatient]);

  return <>{children}</>;
}
