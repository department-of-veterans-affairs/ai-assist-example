import { render, waitFor } from '@testing-library/react';
import type { Patient } from 'fhir/r4';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SmartLaunchProvider } from '@/providers/smart-launch-provider';
import { usePatientStore } from '@/stores/patient-store';

// Mock the dependencies
vi.mock('@/hooks/use-patient', () => ({
  usePatient: vi.fn(),
}));

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@department-of-veterans-affairs/cds-patient-context-lib', () => ({
  useUpdatePatient: vi.fn(),
}));

vi.mock('@/config', () => ({
  CONFIG: {
    smartOnFhirContainerUrl: 'http://test-container.example.com',
  },
}));

describe('SmartLaunchProvider', () => {
  let originalLocation: Location;

  beforeEach(async () => {
    // Save original location
    originalLocation = window.location;

    // Reset Zustand store
    usePatientStore.setState({ patient: null });

    // Clear all mocks
    vi.clearAllMocks();

    // Mock useCurrentUser to return unauthenticated by default
    const { useCurrentUser } = await import('@/hooks/use-current-user');
    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        authenticated: false,
        user_info: null,
      },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      isStale: false,
      isFetched: true,
      isFetching: false,
      isRefetching: false,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isInitialLoading: false,
      isPaused: false,
      isEnabled: true,
      promise: Promise.resolve({
        authenticated: false,
        user_info: null,
      }),
      refetch: vi.fn(),
      status: 'success',
      fetchStatus: 'idle',
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should parse launch context and combine with FHIR patient data', async () => {
    // Create launch context
    const launchContext = {
      patient: '1000000219V596118', // ICN
      sta3n: '530',
      duz: '520824797',
    };
    const encodedLaunch = btoa(JSON.stringify(launchContext));

    // Mock window.location with launch parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: `?launch=${encodedLaunch}&iss=http://test.example.com`,
      },
      writable: true,
      configurable: true,
    });

    // Mock FHIR patient data
    const mockFhirPatient = {
      id: '12345',
      name: [
        {
          family: 'Martinez',
          given: ['Maria', 'Elena'],
        },
      ],
      birthDate: '1975-01-15',
    };

    const { usePatient } = await import('@/hooks/use-patient');
    vi.mocked(usePatient).mockReturnValue(
      mockFhirPatient as unknown as Patient
    );

    // Render provider
    render(
      <SmartLaunchProvider>
        <div>Test Child</div>
      </SmartLaunchProvider>
    );

    // Wait for effects to run
    await waitFor(() => {
      const state = usePatientStore.getState();
      expect(state.patient).toBeDefined();
    });

    // Check that patient store was updated correctly
    const state = usePatientStore.getState();
    expect(state.patient).toEqual({
      id: '12345',
      icn: '1000000219V596118', // From launch context
      dfn: '12345',
      station: '530', // From launch context
      duz: '520824797', // From launch context
      firstName: 'MARIA ELENA',
      lastName: 'MARTINEZ',
      description: '',
      keyConditions: [],
      ssn: '',
      dob: '1975-01-15',
      mrn: '',
    });
  });

  it('should handle missing launch context gracefully', async () => {
    // No launch parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: '',
      },
      writable: true,
      configurable: true,
    });

    // Mock FHIR patient data
    const mockFhirPatient = {
      id: '67890',
      name: [
        {
          family: 'Doe',
          given: ['John'],
        },
      ],
      birthDate: '1980-05-20',
    };

    const { usePatient } = await import('@/hooks/use-patient');
    vi.mocked(usePatient).mockReturnValue(
      mockFhirPatient as unknown as Patient
    );

    // Render provider
    render(
      <SmartLaunchProvider>
        <div>Test Child</div>
      </SmartLaunchProvider>
    );

    // Wait for effects to run
    await waitFor(() => {
      const state = usePatientStore.getState();
      expect(state.patient).toBeDefined();
    });

    // Check that patient store was updated with FHIR data only
    const state = usePatientStore.getState();
    expect(state.patient).toEqual({
      id: '67890',
      icn: '67890', // Falls back to FHIR ID
      dfn: '67890',
      station: '500', // Default station when no launch context
      duz: undefined, // No launch context or user vista_ids
      firstName: 'JOHN',
      lastName: 'DOE',
      description: '',
      keyConditions: [],
      ssn: '',
      dob: '1980-05-20',
      mrn: '',
    });
  });

  it('should handle invalid launch context', async () => {
    // Invalid base64
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: '?launch=invalid-base64',
      },
      writable: true,
      configurable: true,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty to suppress console errors during test
    });

    // Mock FHIR patient data
    const mockFhirPatient = {
      id: '11111',
      name: [{ family: 'Smith', given: ['Jane'] }],
    };

    const { usePatient } = await import('@/hooks/use-patient');
    vi.mocked(usePatient).mockReturnValue(
      mockFhirPatient as unknown as Patient
    );

    // Render provider
    render(
      <SmartLaunchProvider>
        <div>Test Child</div>
      </SmartLaunchProvider>
    );

    // Wait for effects to run
    await waitFor(() => {
      const state = usePatientStore.getState();
      expect(state.patient).toBeDefined();
    });

    // Should log error
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse launch context:',
      expect.any(Error)
    );

    // Should still set patient with FHIR data
    const state = usePatientStore.getState();
    expect(state.patient?.station).toBe('500'); // Default station
    expect(state.patient?.firstName).toBe('JANE');

    consoleSpy.mockRestore();
  });

  it('should handle partial launch context', async () => {
    // Launch context missing duz
    const partialContext = {
      patient: '1000000219V596118',
      sta3n: '530',
      // Missing duz
    };
    const encodedLaunch = btoa(JSON.stringify(partialContext));

    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: `?launch=${encodedLaunch}`,
      },
      writable: true,
      configurable: true,
    });

    // Mock FHIR patient data
    const mockFhirPatient = {
      id: '22222',
      name: [{ family: 'Johnson', given: ['Bob'] }],
    };

    const { usePatient } = await import('@/hooks/use-patient');
    vi.mocked(usePatient).mockReturnValue(
      mockFhirPatient as unknown as Patient
    );

    // Render provider
    render(
      <SmartLaunchProvider>
        <div>Test Child</div>
      </SmartLaunchProvider>
    );

    // Wait for effects to run
    await waitFor(() => {
      const state = usePatientStore.getState();
      expect(state.patient).toBeDefined();
    });

    // Should not use partial context
    const state = usePatientStore.getState();
    expect(state.patient?.icn).toBe('22222'); // Falls back to FHIR ID
    expect(state.patient?.station).toBe('500'); // Default station when partial context
    expect(state.patient?.duz).toBeUndefined();
  });

  it('should not update store when no FHIR patient is available', async () => {
    // Valid launch context
    const launchContext = {
      patient: '1000000219V596118',
      sta3n: '530',
      duz: '520824797',
    };
    const encodedLaunch = btoa(JSON.stringify(launchContext));

    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: `?launch=${encodedLaunch}`,
      },
      writable: true,
      configurable: true,
    });

    // No FHIR patient data
    const { usePatient } = await import('@/hooks/use-patient');
    vi.mocked(usePatient).mockReturnValue(undefined);

    // Render provider
    render(
      <SmartLaunchProvider>
        <div>Test Child</div>
      </SmartLaunchProvider>
    );

    // Wait for effects to run and ensure patient remains null
    await waitFor(() => {
      expect(usePatientStore.getState().patient).toBeNull();
    });

    // Patient store should not be updated
    const state = usePatientStore.getState();
    expect(state.patient).toBeNull();
  });
});
