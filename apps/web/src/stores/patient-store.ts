import { create } from 'zustand';

export interface PatientContextProps {
  firstName: string;
  lastName: string;
  description: string;
  keyConditions: string[];
  ssn: string;
}

export interface Patient extends PatientContextProps {
  id?: string; // FHIR resource ID
  icn?: string; // (primary identifier for VA)
  dfn?: string; // DFN - kept for backward compatibility
  station?: string; // Station number
  description: string;
  keyConditions: string[];
  ssn: string;
  dob?: string;
  mrn?: string;
}

// Hardcoded test patient: TEST, PATIENT
const TEST_PATIENT: Patient = {
  id: 'TEST001', // FHIR resource ID
  icn: '1000000219V596118', // Test ICN (primary identifier)
  dfn: 'TEST001', // DFN for backward compatibility
  station: '500', // Default station for development
  firstName: 'John',
  lastName: 'Doe',
  description: 'Test Patient for Development',
  keyConditions: ['Test Condition 1', 'Test Condition 2', 'Test Condition 3'],
  ssn: '000-00-0000',
  dob: '01/01/1990',
  mrn: 'MRN: TEST001',
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
