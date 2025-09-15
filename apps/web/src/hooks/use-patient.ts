import type { Patient } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { useEffect, useState } from 'react';

const usePatient = (client: Client | undefined): Patient | undefined => {
  const [patient, setPatient] = useState<Patient>();

  useEffect(() => {
    const readPatient = async () => {
      const fhirPatient = await client?.patient.read();
      if (fhirPatient) {
        setPatient(fhirPatient);
      }
    };

    readPatient();
  }, [client]);

  return patient;
};

export default usePatient;
