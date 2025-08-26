import type { Patient as FHIRPatient } from 'fhir/r4';
import FHIR from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { useEffect, useState } from 'react';
import { type Patient, usePatientStore } from '@/stores/patient-store';
import { getEnvVar } from '@/utils/helpers';

interface LaunchContext {
  patient: string; // ICN
  sta3n: string;
  duz: string;
}

// Validate launch context structure
function validateLaunchContext(data: unknown): LaunchContext {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid launch context: not an object');
  }

  const context = data as Record<string, unknown>;

  if (typeof context.patient !== 'string' || !context.patient) {
    throw new Error('Invalid launch context: missing or invalid patient');
  }
  if (typeof context.sta3n !== 'string' || !context.sta3n) {
    throw new Error('Invalid launch context: missing or invalid sta3n');
  }
  if (typeof context.duz !== 'string' || !context.duz) {
    throw new Error('Invalid launch context: missing or invalid duz');
  }

  return {
    patient: context.patient,
    sta3n: context.sta3n,
    duz: context.duz,
  };
}

async function initializeFhirClient(iss: string) {
  return await FHIR.oauth2.init({
    clientId: getEnvVar('VITE_AUTH_CLIENT_ID'),
    scope: getEnvVar('VITE_AUTH_SCOPES'),
    redirectUri: getEnvVar('VITE_AUTH_REDIRECT_URI', 'index.html'),
    pkceMode: getEnvVar('VITE_AUTH_PKCE_MODE', 'unsafeV1') as
      | 'ifSupported'
      | 'required'
      | 'disabled'
      | 'unsafeV1',
    iss,
    completeInTarget: true,
  });
}

function parsePatientName(fhirPatient: FHIRPatient) {
  const firstName = fhirPatient.name?.[0]?.given?.join(' ') ?? '';
  const lastName = fhirPatient.name?.[0]?.family ?? '';
  return {
    firstName: firstName.toUpperCase(),
    lastName: lastName.toUpperCase(),
  };
}

async function handleSmartLaunch(
  launch: string,
  iss: string,
  setClient: (client: Client) => void,
  setPatient: (patient: Patient) => void
) {
  // Decode and validate launch context (base64 encoded JSON)
  let context: LaunchContext;
  try {
    const decoded = atob(launch);
    const parsed = JSON.parse(decoded);
    context = validateLaunchContext(parsed);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Invalid launch parameter: ${err.message}`);
    }
    throw new Error('Invalid launch parameter: failed to decode or parse');
  }

  // Initialize FHIR client with OAuth2
  const fhirClient = await initializeFhirClient(iss);
  setClient(fhirClient);

  // Get patient data from FHIR with error handling
  let fhirPatient: FHIRPatient;
  try {
    fhirPatient = await fhirClient.patient.read();
  } catch (err: unknown) {
    // FHIR client errors may have response or status
    const error = err as {
      response?: { status?: number; statusText?: string };
      status?: number;
    };
    if (error?.response?.status === 404 || error?.status === 404) {
      throw new Error('Patient not found in FHIR server');
    }
    if (error?.response) {
      throw new Error(
        `FHIR API error: ${error.response.status} ${error.response.statusText}`
      );
    }
    if (err instanceof Error) {
      throw new Error(`Failed to fetch patient: ${err.message}`);
    }
    throw new Error('Unknown error occurred while fetching patient from FHIR');
  }
  const { firstName, lastName } = parsePatientName(fhirPatient);

  // Update Zustand store with combined data
  setPatient({
    dfn: '', // DFN would need to be fetched separately or mapped
    firstName,
    lastName,
    description: '',
    keyConditions: [],
    ssn: '', // SSN would need separate authorization
    // SMART context
    icn: context.patient,
    sta3n: context.sta3n,
    duz: context.duz,
  });
}

function checkLaunchParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    launch: urlParams.get('launch'),
    iss: urlParams.get('iss'),
  };
}

function isLocalDev(launch: string | null) {
  return !launch && process.env.NODE_ENV === 'development';
}

export function useSmartLaunch() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setPatient = usePatientStore((state) => state.setPatient);

  useEffect(() => {
    const init = async () => {
      try {
        const { launch, iss } = checkLaunchParams();

        if (isLocalDev(launch)) {
          setLoading(false);
          return;
        }

        if (!(launch && iss)) {
          throw new Error('Missing required launch parameters');
        }

        await handleSmartLaunch(launch, iss, setClient, setPatient);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [setPatient]);

  return { client, loading, error };
}
