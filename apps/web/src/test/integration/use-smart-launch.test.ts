import { renderHook, waitFor } from '@testing-library/react';
import FHIR from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientStore } from '@/stores/patient-store';
import { useSmartLaunch } from '../../hooks/use-smart-launch';

// Mock fhirclient
vi.mock('fhirclient', () => ({
  default: {
    oauth2: {
      init: vi.fn(),
    },
  },
}));

// Mock the patient store
vi.mock('@/stores/patient-store', () => ({
  usePatientStore: vi.fn(),
}));

describe('useSmartLaunch', () => {
  const mockSetPatient = vi.fn();
  const mockPatientRead = vi.fn();
  const mockFhirClient = {
    patient: {
      read: mockPatientRead,
    },
  } as unknown as Client;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock
    (usePatientStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSetPatient
    );
    (usePatientStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: unknown) =>
        typeof selector === 'function'
          ? (
              selector as (store: {
                setPatient: typeof mockSetPatient;
              }) => unknown
            )({ setPatient: mockSetPatient })
          : mockSetPatient
    );

    // Reset window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        search: '',
      },
      writable: true,
    });

    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Local Development Mode', () => {
    it('should return immediately without loading when no launch params in development', async () => {
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.client).toBe(null);
      });

      expect(FHIR.oauth2.init).not.toHaveBeenCalled();
      expect(mockSetPatient).not.toHaveBeenCalled();
    });
  });

  describe('SMART Launch with Valid Parameters', () => {
    it('should successfully initialize FHIR client and fetch patient data', async () => {
      // Setup valid launch context
      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      // Set URL params
      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      // Mock FHIR client initialization
      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      // Mock patient data
      const mockPatientData = {
        resourceType: 'Patient',
        id: '123',
        name: [
          {
            family: 'Doe',
            given: ['John', 'Michael'],
          },
        ],
      };
      mockPatientRead.mockResolvedValue(mockPatientData);

      const { result } = renderHook(() => useSmartLaunch());

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify FHIR client was initialized with correct config
      expect(FHIR.oauth2.init).toHaveBeenCalledWith({
        clientId: 'Lighthouse_NP',
        scope: 'launch fhirUser openid profile patient/Patient.read',
        redirectUri: 'index.html',
        pkceMode: 'unsafeV1',
        iss: 'https://fhir.example.com',
        completeInTarget: true,
      });

      // Verify patient was set with combined data
      expect(mockSetPatient).toHaveBeenCalledWith({
        dfn: '',
        firstName: 'JOHN MICHAEL',
        lastName: 'DOE',
        description: '',
        keyConditions: [],
        ssn: '',
        icn: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      });

      // Verify final state
      expect(result.current.client).toBe(mockFhirClient);
      expect(result.current.error).toBe(null);
    });

    it('should handle patient with missing name gracefully', async () => {
      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      // Patient with no name
      const mockPatientData = {
        resourceType: 'Patient',
        id: '123',
      };
      mockPatientRead.mockResolvedValue(mockPatientData);

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSetPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: '',
          lastName: '',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing launch parameters', async () => {
      window.location.search = '?iss=https://fhir.example.com';

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Missing required launch parameters');
      expect(FHIR.oauth2.init).not.toHaveBeenCalled();
    });

    it('should handle missing iss parameter', async () => {
      const encodedLaunch = btoa(
        JSON.stringify({ patient: 'ICN123', sta3n: '673', duz: 'DUZ789' })
      );
      window.location.search = `?launch=${encodedLaunch}`;

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Missing required launch parameters');
    });

    it('should handle invalid base64 launch parameter', async () => {
      window.location.search =
        '?launch=invalid-base64!@#&iss=https://fhir.example.com';

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('Invalid launch parameter');
    });

    it('should handle invalid JSON in launch parameter', async () => {
      const invalidJson = btoa('not-valid-json{');
      window.location.search = `?launch=${invalidJson}&iss=https://fhir.example.com`;

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('Invalid launch parameter');
    });

    it('should validate launch context structure - missing patient', async () => {
      const invalidContext = btoa(
        JSON.stringify({ sta3n: '673', duz: 'DUZ789' })
      );
      window.location.search = `?launch=${invalidContext}&iss=https://fhir.example.com`;

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('missing or invalid patient');
    });

    it('should validate launch context structure - missing sta3n', async () => {
      const invalidContext = btoa(
        JSON.stringify({ patient: 'ICN123', duz: 'DUZ789' })
      );
      window.location.search = `?launch=${invalidContext}&iss=https://fhir.example.com`;

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('missing or invalid sta3n');
    });

    it('should handle FHIR client initialization failure', async () => {
      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('OAuth initialization failed')
      );

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('OAuth initialization failed');
    });

    it('should handle patient not found (404) error', async () => {
      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      // Mock 404 error
      const error404 = { response: { status: 404 } };
      mockPatientRead.mockRejectedValue(error404);

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Patient not found in FHIR server');
    });

    it('should handle FHIR API error with response details', async () => {
      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      // Mock API error
      const apiError = {
        response: {
          status: 403,
          statusText: 'Forbidden',
        },
      };
      mockPatientRead.mockRejectedValue(apiError);

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('FHIR API error: 403 Forbidden');
    });
  });

  describe('Environment Variable Validation', () => {
    it('should use fallback values for optional environment variables', async () => {
      const originalEnv = { ...import.meta.env };
      Object.defineProperty(import.meta, 'env', {
        value: {
          VITE_AUTH_CLIENT_ID: 'Lighthouse_NP',
          VITE_AUTH_SCOPES:
            'launch fhirUser openid profile patient/Patient.read',
          // Missing VITE_AUTH_REDIRECT_URI and VITE_AUTH_PKCE_MODE
          MODE: 'test',
          NODE_ENV: 'test',
        },
        writable: true,
      });

      const launchContext = {
        patient: 'ICN123456789',
        sta3n: '673',
        duz: 'DUZ789',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://fhir.example.com`;

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );
      mockPatientRead.mockResolvedValue({
        resourceType: 'Patient',
        id: '123',
      });

      const { result } = renderHook(() => useSmartLaunch());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should use default values
      expect(FHIR.oauth2.init).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: 'index.html', // default value
          pkceMode: 'unsafeV1', // default value
        })
      );

      // Restore env vars
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv,
        writable: true,
      });
    });
  });
});
