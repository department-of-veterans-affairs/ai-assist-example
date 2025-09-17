import type { Patient as FHIRPatient } from 'fhir/r4';
import { useEffect } from 'react';
import { useFhirClient } from '@/providers/fhir-client-provider';
import { type Patient, usePatientStore } from '@/stores/patient-store';

// Regex patterns for extracting station numbers
const STATION_PREFIX_REGEX = /^(\d{3})/;
const STATION_WORD_REGEX = /\b(\d{3})\b/;

function parsePatientName(fhirPatient: FHIRPatient) {
  const firstName = fhirPatient.name?.[0]?.given?.join(' ') ?? '';
  const lastName = fhirPatient.name?.[0]?.family ?? '';
  return {
    firstName: firstName.toUpperCase(),
    lastName: lastName.toUpperCase(),
  };
}

function parsePatientIdentifiers(fhirPatient: FHIRPatient) {
  const identifiers = fhirPatient.identifier || [];

  // Look for common VA identifier types
  const icn = identifiers.find(
    (id) =>
      id.system?.includes('icn') || id.type?.text?.toLowerCase().includes('icn')
  )?.value;
  const mrn = identifiers.find(
    (id) =>
      id.system?.includes('mrn') || id.type?.text?.toLowerCase().includes('mrn')
  )?.value;
  const ssn = identifiers.find(
    (id) =>
      id.system?.includes('ssn') || id.type?.text?.toLowerCase().includes('ssn')
  )?.value;

  return { icn, mrn, ssn };
}

function extractStationFromIdentifiers(
  identifiers: FHIRPatient['identifier']
): string | undefined {
  if (!identifiers) {
    return;
  }

  for (const id of identifiers) {
    // Look for MPI identifier which often contains station
    if (id.system?.includes('mpi') && id.value) {
      // Extract station from ICN format like "6050242829V596118"
      // Station is typically embedded in the identifier
      const match = id.value.match(STATION_PREFIX_REGEX); // First 3 digits often station
      if (match) {
        return match[1];
      }
    }
  }
  return;
}

function extractStationFromOrganization(
  managingOrganization: FHIRPatient['managingOrganization']
): string | undefined {
  if (managingOrganization?.display) {
    // Extract from display like "Station 500" or "Site #530"
    const match = managingOrganization.display.match(STATION_WORD_REGEX);
    if (match) {
      return match[1];
    }
  }
  return;
}

function extractStationFromExtensions(
  extensions: FHIRPatient['extension']
): string | undefined {
  if (!extensions) {
    return;
  }

  for (const ext of extensions) {
    if (ext.url?.includes('facility') || ext.url?.includes('station')) {
      const value = ext.valueString || ext.valueCode;
      if (value) {
        const match = value.match(STATION_WORD_REGEX);
        if (match) {
          return match[1];
        }
      }
    }
  }
  return;
}

function extractStationFromPatient(
  fhirPatient: FHIRPatient
): string | undefined {
  // Try to extract station from various places in FHIR patient
  return (
    extractStationFromIdentifiers(fhirPatient.identifier) ||
    extractStationFromOrganization(fhirPatient.managingOrganization) ||
    extractStationFromExtensions(fhirPatient.extension)
  );
}

export function usePatientFromFhir() {
  const { client } = useFhirClient();
  const setPatient = usePatientStore((state) => state.setPatient);

  useEffect(() => {
    const loadPatient = async () => {
      if (!client) {
        console.log('No FHIR client available - not loading patient data');
        return;
      }

      try {
        console.log('Loading patient data from FHIR client...');

        const fhirPatient: FHIRPatient = await client.patient.read();

        console.log('FHIR Patient data:', fhirPatient);

        const { firstName, lastName } = parsePatientName(fhirPatient);
        const { icn, mrn, ssn } = parsePatientIdentifiers(fhirPatient);
        const station = extractStationFromPatient(fhirPatient);

        const patientData: Patient = {
          id: fhirPatient.id, // FHIR resource ID
          icn: icn || fhirPatient.id || '', // ICN is primary identifier
          dfn: fhirPatient.id, // Use FHIR ID as DFN for backward compatibility
          sta3n: station, // Station number for Vista site identification
          firstName,
          lastName,
          description: '',
          keyConditions: [],
          ssn: ssn || '',
          dob: fhirPatient.birthDate || '',
          mrn: mrn || '',
        };

        console.log('Setting patient in store:', patientData);

        setPatient(patientData);
      } catch (error) {
        console.error('Failed to load patient from FHIR:', error);
      }
    };

    loadPatient();
  }, [client, setPatient]);
}
