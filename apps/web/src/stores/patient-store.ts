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

interface PatientStore {
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
  clearPatient: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  // Initialize with null - patient will be set by SMART launch or manually
  patient: null,

  setPatient: (patient) => set({ patient }),

  clearPatient: () => set({ patient: null }),
}));
