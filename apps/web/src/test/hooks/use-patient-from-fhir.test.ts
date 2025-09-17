import { renderHook, waitFor } from '@testing-library/react';
import type Client from 'fhirclient/lib/Client';
import { describe, expect, it, vi } from 'vitest';
import { usePatientFromFhir } from '@/hooks/use-patient-from-fhir';

// Mock the providers
vi.mock('@/providers/fhir-client-provider', () => ({
  useFhirClient: vi.fn(),
}));

vi.mock('@/stores/patient-store', () => ({
  usePatientStore: vi.fn(),
}));

describe('usePatientFromFhir', () => {
  it('should extract ICN from FHIR patient identifiers', async () => {
    const mockSetPatient = vi.fn();
    const mockFhirPatient = {
      id: '6050242829V596118',
      name: [
        {
          family: 'Harris',
          given: ['Sheba'],
        },
      ],
      identifier: [
        {
          system: 'http://example.com/mpi',
          value: '6050242829V596118',
        },
      ],
      birthDate: '1926-01-07',
    };

    const mockClient = {
      patient: {
        read: vi.fn().mockResolvedValue(mockFhirPatient),
      },
    } as unknown as Client;

    const { useFhirClient } = await import('@/providers/fhir-client-provider');
    const { usePatientStore } = await import('@/stores/patient-store');

    vi.mocked(useFhirClient).mockReturnValue({ client: mockClient });
    vi.mocked(usePatientStore).mockReturnValue(mockSetPatient);

    renderHook(() => usePatientFromFhir());

    await waitFor(() => {
      expect(mockSetPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '6050242829V596118',
          icn: '6050242829V596118',
          dfn: '6050242829V596118', // Should use ID as DFN for compatibility
          firstName: 'SHEBA',
          lastName: 'HARRIS',
        })
      );
    });
  });

  it('should extract station from managing organization', async () => {
    const mockSetPatient = vi.fn();
    const mockFhirPatient = {
      id: '100023',
      name: [
        {
          family: 'Martinez',
          given: ['Maria', 'Elena'],
        },
      ],
      managingOrganization: {
        display: 'Site #530',
      },
      birthDate: '1975-01-15',
    };

    const mockClient = {
      patient: {
        read: vi.fn().mockResolvedValue(mockFhirPatient),
      },
    } as unknown as Client;

    const { useFhirClient } = await import('@/providers/fhir-client-provider');
    const { usePatientStore } = await import('@/stores/patient-store');

    vi.mocked(useFhirClient).mockReturnValue({ client: mockClient });
    vi.mocked(usePatientStore).mockReturnValue(mockSetPatient);

    renderHook(() => usePatientFromFhir());

    await waitFor(() => {
      expect(mockSetPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          sta3n: '530',
        })
      );
    });
  });

  it('should handle missing ICN by using patient ID', async () => {
    const mockSetPatient = vi.fn();
    const mockFhirPatient = {
      id: '12345',
      name: [
        {
          family: 'Doe',
          given: ['John'],
        },
      ],
      birthDate: '1980-05-20',
    };

    const mockClient = {
      patient: {
        read: vi.fn().mockResolvedValue(mockFhirPatient),
      },
    } as unknown as Client;

    const { useFhirClient } = await import('@/providers/fhir-client-provider');
    const { usePatientStore } = await import('@/stores/patient-store');

    vi.mocked(useFhirClient).mockReturnValue({ client: mockClient });
    vi.mocked(usePatientStore).mockReturnValue(mockSetPatient);

    renderHook(() => usePatientFromFhir());

    await waitFor(() => {
      expect(mockSetPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '12345',
          icn: '12345', // Falls back to ID when ICN not found
          dfn: '12345',
        })
      );
    });
  });
});
