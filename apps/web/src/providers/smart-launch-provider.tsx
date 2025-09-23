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

function resolveStationAndDuz(
  launchContext: LaunchContext | null,
  currentUser:
    | {
        authenticated: boolean;
        user_info: {
          vista_ids: Array<{ site_id: string; duz: string }>;
        } | null;
      }
    | undefined
): { station: string; duz: string | undefined } {
  let station = launchContext?.sta3n;
  let duz = launchContext?.duz;

  if (
    !station &&
    currentUser?.authenticated &&
    currentUser.user_info?.vista_ids?.length
  ) {
    station = currentUser.user_info.vista_ids[0].site_id;
    duz = currentUser.user_info.vista_ids[0].duz;
  }

  if (!station) {
    station = '500';
  }

  if (
    station &&
    !duz &&
    currentUser?.authenticated &&
    currentUser.user_info?.vista_ids
  ) {
    const vistaId = currentUser.user_info.vista_ids.find(
      (v) => v.site_id === station
    );
    if (vistaId) {
      duz = vistaId.duz;
    }
  }

  return { station, duz };
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

      const { station, duz } = resolveStationAndDuz(launchContext, currentUser);

      setPatient({
        id: fhirPatient.id,
        icn: launchContext?.patient || fhirPatient.id,
        dfn: fhirPatient.id,
        station,
        duz,
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        description: '',
        keyConditions: [],
        ssn: '',
        dob: fhirPatient.birthDate || '',
        mrn: '',
      });
    } else if (import.meta.env.DEV && currentUser?.authenticated) {
      const existingPatient = usePatientStore.getState().patient;
      if (existingPatient && !existingPatient.duz) {
        const { duz } = resolveStationAndDuz(null, currentUser);
        setPatient({
          ...existingPatient,
          duz,
        });
      }
    }
  }, [fhirPatient, launchContext, currentUser, setPatient]);

  return <>{children}</>;
}
