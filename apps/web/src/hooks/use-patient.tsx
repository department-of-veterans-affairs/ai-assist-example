import type { Patient } from 'fhir/r4';
import { useEffect, useState } from 'react';
import { useFhirClient } from '@/providers/fhir-client-provider';

export function usePatient(): Patient | undefined {
  const { client } = useFhirClient();
  const [patient, setPatient] = useState<Patient>();

  useEffect(() => {
    const readPatient = async () => {
      if (!client) {
        return;
      }

      try {
        const fhirPatient = await client.patient.read();
        if (fhirPatient) {
          setPatient(fhirPatient);
        }
      } catch (error) {
        console.error('Failed to read patient from FHIR:', error);
      }
    };

    readPatient();
  }, [client]);

  return patient;
}
