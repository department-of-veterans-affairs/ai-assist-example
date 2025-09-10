import type { Patient as FHIRPatient } from 'fhir/r4';
import { useEffect } from 'react';
import { useFhirClient } from '@/providers/fhir-client-provider';
import { type Patient, usePatientStore } from '@/stores/patient-store';

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

export function usePatientFromFhir() {
  const { client } = useFhirClient();
  const setPatient = usePatientStore((state) => state.setPatient);

  useEffect(() => {
    const loadPatient = async () => {
      if (!client) {
        // biome-ignore lint/suspicious/noConsole: Debugging patient loading
        console.log('No FHIR client available - not loading patient data');
        return;
      }

      try {
        // biome-ignore lint/suspicious/noConsole: Debugging patient loading
        console.log('Loading patient data from FHIR client...');

        const fhirPatient: FHIRPatient = await client.patient.read();

        // biome-ignore lint/suspicious/noConsole: Debugging patient data
        console.log('FHIR Patient data:', fhirPatient);

        const { firstName, lastName } = parsePatientName(fhirPatient);
        const { icn, mrn, ssn } = parsePatientIdentifiers(fhirPatient);

        const patientData: Patient = {
          dfn: '', // Not available from FHIR
          firstName,
          lastName,
          description: '',
          keyConditions: [],
          ssn: ssn || '',
          dob: fhirPatient.birthDate || '',
          mrn: mrn || '',
          icn: icn || fhirPatient.id || '',
          sta3n: '500', // Default for SMART launcher
          duz: '12345', // Default for SMART launcher
        };

        // biome-ignore lint/suspicious/noConsole: Debugging patient data transformation
        console.log('Setting patient in store:', patientData);

        setPatient(patientData);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Debugging patient loading errors
        console.error('Failed to load patient from FHIR:', error);
      }
    };

    loadPatient();
  }, [client, setPatient]);
}
