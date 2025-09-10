declare module '@department-of-veterans-affairs/cds-patient-context-lib' {
  export interface UpdatePatientError {
    title: string;
    message: string;
  }

  export interface UseUpdatePatientResult {
    updatePatient: (icn: string) => void;
    errorMessage: UpdatePatientError | null;
    isLoading: boolean;
    isSuccess: boolean;
  }

  export function useUpdatePatient(
    containerUrl: string
  ): UseUpdatePatientResult;
}
