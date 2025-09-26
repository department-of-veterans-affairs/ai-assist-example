import { useQuery } from '@tanstack/react-query';

import { fetchApi } from '@/lib/api';
import type { Patient } from '@/stores/patient-store';
import type { MedicationSummary } from '@/types/medication-summary';

type SummaryEnvelopeResponse = {
  summary_type: 'medication';
  data: MedicationSummary;
};

type UseMedicationSummaryParams = {
  patient: Patient | null;
  enabled: boolean;
};

const buildRequestBody = (patient: Patient | null) => {
  const identifier = patient?.icn ?? patient?.id;

  if (!identifier) {
    return null;
  }

  return {
    patient: {
      icn: identifier,
      dfn: patient?.dfn ?? null,
      station: patient?.station ?? null,
      firstName: patient?.firstName ?? null,
      lastName: patient?.lastName ?? null,
    },
  };
};

const parseSummary = async (response: Response): Promise<MedicationSummary> => {
  if (!response.ok) {
    throw new Error(`Summary request failed: ${response.status}`);
  }

  const payload = (await response.json()) as SummaryEnvelopeResponse;

  if (payload.summary_type !== 'medication' || !payload.data) {
    throw new Error('Invalid summary response');
  }

  return payload.data;
};

export function useMedicationSummary({
  enabled,
  patient,
}: UseMedicationSummaryParams) {
  const requestBody = buildRequestBody(patient);

  return useQuery({
    queryKey: [
      'medication-summary',
      requestBody?.patient.icn,
      requestBody?.patient.dfn,
      requestBody?.patient.station,
    ],
    enabled: enabled && Boolean(requestBody),
    queryFn: async () => {
      if (!requestBody) {
        throw new Error('Patient context missing ICN/ID');
      }

      const response = await fetchApi('summaries/medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      return parseSummary(response);
    },
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
