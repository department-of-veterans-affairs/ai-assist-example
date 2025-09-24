import { useUpdatePatient } from '@department-of-veterans-affairs/cds-patient-context-lib';
import { type ReactNode, useEffect, useMemo } from 'react';
import { CONFIG } from '@/config';
import { useCurrentUser } from '@/hooks/use-current-user';
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

function resolveStation(
  launchContext: LaunchContext | null,
  currentUser:
    | {
        authenticated: boolean;
        user_info: {
          vista_ids: Array<{ site_id: string; duz: string }>;
        } | null;
      }
    | undefined
): string {
  let station = launchContext?.sta3n;

  if (
    !station &&
    currentUser?.authenticated &&
    currentUser.user_info?.vista_ids?.length
  ) {
    station = currentUser.user_info.vista_ids[0].site_id;
  }

  if (!station) {
    station = '500';
  }

  return station;
}

export function SmartLaunchProvider({ children }: SmartLaunchProviderProps) {
  const smartContainerUrl = CONFIG.smartOnFhirContainerUrl;
  useUpdatePatient(smartContainerUrl);

  const launchContext = useMemo(() => parseLaunchContext(), []);
  const fhirPatient = usePatient();
  const setPatient = usePatientStore((state) => state.setPatient);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (fhirPatient) {
      const firstName = fhirPatient.name?.[0]?.given?.join(' ') ?? '';
      const lastName = fhirPatient.name?.[0]?.family ?? '';

      const station = resolveStation(launchContext, currentUser);

      setPatient({
        id: fhirPatient.id,
        icn: launchContext?.patient || fhirPatient.id,
        dfn: fhirPatient.id,
        station,
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        description: '',
        keyConditions: [],
        ssn: '',
        dob: fhirPatient.birthDate || '',
        mrn: '',
      });
    }
  }, [fhirPatient, launchContext, currentUser, setPatient]);

  return <>{children}</>;
}
