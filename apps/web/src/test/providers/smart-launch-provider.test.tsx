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
      patient: 'TEST123456V123456', // ICN
      sta3n: 'TEST001',
      duz: 'TEST001001',
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
      id: 'TEST001',
      name: [
        {
          family: 'TestPatient',
          given: ['Test', 'User'],
        },
      ],
      birthDate: '1990-01-01',
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
      id: 'TEST001',
      icn: 'TEST123456V123456', // From launch context
      dfn: 'TEST001',
      station: 'TEST001', // From launch context
      firstName: 'TEST USER',
      lastName: 'TESTPATIENT',
      description: '',
      keyConditions: [],
      ssn: '',
      dob: '1990-01-01',
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
      id: 'TEST002',
      name: [
        {
          family: 'TestUser',
          given: ['Test'],
        },
      ],
      birthDate: '1990-01-01',
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
      id: 'TEST002',
      icn: 'TEST002', // Falls back to FHIR ID
      dfn: 'TEST002',
      station: 'TEST001', // Default station when no launch context
      duz: undefined, // No launch context or user vista_ids
      firstName: 'TEST',
      lastName: 'TESTUSER',
      description: '',
      keyConditions: [],
      ssn: '',
      dob: '1990-01-01',
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
      id: 'TEST003',
      name: [{ family: 'TestUser', given: ['Test'] }],
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
    expect(state.patient?.station).toBe('TEST001'); // Default station
    expect(state.patient?.firstName).toBe('TEST');

    consoleSpy.mockRestore();
  });

  it('should handle partial launch context', async () => {
    // Launch context missing duz
    const partialContext = {
      patient: 'TEST123456V123456',
      sta3n: 'TEST001',
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
      id: 'TEST004',
      name: [{ family: 'TestUser', given: ['Test'] }],
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
    expect(state.patient?.icn).toBe('TEST004'); // Falls back to FHIR ID
    expect(state.patient?.station).toBe('TEST001'); // Default station when partial context
  });

  it('should not update store when no FHIR patient is available', async () => {
    // Valid launch context
    const launchContext = {
      patient: 'TEST123456V123456',
      sta3n: 'TEST001',
      duz: 'TEST001001',
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
