import type { Header as VACDSHeader } from '@department-of-veterans-affairs/clinical-design-system';
import type { ComponentProps } from 'react';
import { create } from 'zustand';

// Type was not exported from VACDSHeader, so we need to define it here
export type PatientContextProps = NonNullable<
  ComponentProps<typeof VACDSHeader>['patientContextProps']
>;

export interface Patient extends PatientContextProps {
  dfn: string;
  description: string;
  keyConditions: string[];
  ssn: string;
  // SMART on FHIR context
  icn?: string;
  sta3n?: string;
  duz?: string;
  dob?: string;
  mrn?: string;
}

// Hardcoded test patient: MARTINEZ, MARIA ELENA
const TEST_PATIENT: Patient = {
  dfn: '100023',
  firstName: 'MARIA ELENA',
  lastName: 'MARTINEZ',
  description: 'Female Gulf War Veteran',
  keyConditions: ['Fibromyalgia', 'Depression', 'MST'],
  ssn: '123-45-6789',
  dob: '01/15/1975',
  mrn: 'MRN: 123456',
};

interface PatientStore {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
  clearPatient: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  // Initialize with test patient in local dev, null in production
  patient: import.meta.env.DEV ? TEST_PATIENT : null,

  setPatient: (patient) => set({ patient }),

  clearPatient: () => set({ patient: null }),
}));
