import { render, screen, waitFor } from '@testing-library/react';
import FHIR from 'fhirclient';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/app';
import { usePatientStore } from '@/stores/patient-store';

// Mock modules
vi.mock('fhirclient', () => ({
  default: {
    oauth2: {
      init: vi.fn(),
    },
  },
}));

vi.mock('@/stores/patient-store');

// Mock components that aren't relevant to SMART launch
vi.mock('@/components/layout/root-layout', () => ({
  RootLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="root-layout">{children}</div>
  ),
}));

vi.mock('@/pages/chat', () => ({
  default: () => <div data-testid="chat-page">Chat Page</div>,
}));

describe('SMART Launch Integration Flow', () => {
  const mockSetPatient = vi.fn();
  const mockResetPatient = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup patient store mock
    const mockStore = {
      setPatient: mockSetPatient,
      resetPatient: mockResetPatient,
      patient: null,
    };

    (usePatientStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: unknown) => {
        if (typeof selector === 'function') {
          return (selector as (store: typeof mockStore) => unknown)(mockStore);
        }
        return mockStore;
      }
    );

    // Reset window location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        search: '',
      },
      writable: true,
    });
  });

  describe('Full SMART Launch Flow', () => {
    it('should complete full SMART launch flow successfully', async () => {
      // Simulate VA SMART launch parameters
      const launchContext = {
        patient: 'ICN1234567890V123456',
        sta3n: '673',
        duz: 'DUZ1234567',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://api.example.com/services/fhir/v0/r4`;

      // Mock FHIR client
      const mockFhirClient = {
        patient: {
          read: vi.fn().mockResolvedValue({
            resourceType: 'Patient',
            id: '1234567890V123456',
            identifier: [
              {
                system: 'http://example.com/systems/ICN',
                value: '1234567890V123456',
              },
            ],
            name: [
              {
                use: 'official',
                family: 'VETERAN',
                given: ['JOHN', 'QUINCY'],
              },
            ],
            birthDate: '1950-01-15',
            gender: 'male',
          }),
        },
        state: {
          tokenResponse: {
            access_token: 'mock-access-token',
            patient: '1234567890V123456',
          },
        },
      };

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Should show loading initially
      expect(
        screen.getByText('Initializing SMART on FHIR')
      ).toBeInTheDocument();

      // Wait for SMART launch to complete
      await waitFor(() => {
        expect(screen.getByTestId('chat-page')).toBeInTheDocument();
      });

      // Verify FHIR.oauth2.init was called with correct parameters
      expect(FHIR.oauth2.init).toHaveBeenCalledWith({
        clientId: 'Lighthouse_NP',
        scope: 'launch fhirUser openid profile patient/Patient.read',
        redirectUri: 'index.html',
        pkceMode: 'unsafeV1',
        iss: 'https://api.example.com/services/fhir/v0/r4',
        completeInTarget: true,
      });

      // Verify patient data was set correctly
      expect(mockSetPatient).toHaveBeenCalledWith({
        dfn: '',
        firstName: 'JOHN QUINCY',
        lastName: 'VETERAN',
        description: '',
        keyConditions: [],
        ssn: '',
        icn: 'ICN1234567890V123456',
        sta3n: '673',
        duz: 'DUZ1234567',
      });

      // Verify app rendered successfully
      expect(screen.getByTestId('root-layout')).toBeInTheDocument();
      expect(screen.getByTestId('chat-page')).toBeInTheDocument();
    });

    it('should handle error gracefully and continue to render app', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Invalid launch parameter
      window.location.search =
        '?launch=invalid&iss=https://api.example.com/services/fhir/v0/r4';

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          // Intentionally empty - suppressing console.warn in tests
        });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByTestId('chat-page')).toBeInTheDocument();
      });

      // Verify error was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SMART launch error:'),
        expect.any(String),
        expect.stringContaining('continuing with app for local development')
      );

      // App should still render
      expect(screen.getByTestId('root-layout')).toBeInTheDocument();
      expect(screen.getByTestId('chat-page')).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should work in local development without SMART launch', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // No launch parameters - simulating local development
      window.location.search = '';

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Should not show loading for long
      await waitFor(() => {
        expect(screen.getByTestId('chat-page')).toBeInTheDocument();
      });

      // FHIR client should not be initialized
      expect(FHIR.oauth2.init).not.toHaveBeenCalled();

      // Patient should not be set
      expect(mockSetPatient).not.toHaveBeenCalled();

      // App should render normally
      expect(screen.getByTestId('root-layout')).toBeInTheDocument();
      expect(screen.getByTestId('chat-page')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('VA-Specific Scenarios', () => {
    it('should handle VA patient with multiple identifiers', async () => {
      const launchContext = {
        patient: 'ICN1234567890V123456',
        sta3n: '673',
        duz: 'DUZ1234567',
      };
      const encodedLaunch = btoa(JSON.stringify(launchContext));

      window.location.search = `?launch=${encodedLaunch}&iss=https://api.example.com/services/fhir/v0/r4`;

      const mockFhirClient = {
        patient: {
          read: vi.fn().mockResolvedValue({
            resourceType: 'Patient',
            id: '1234567890V123456',
            identifier: [
              {
                system: 'http://example.com/systems/ICN',
                value: '1234567890V123456',
              },
              {
                system: 'http://example.com/systems/DFN',
                value: '123456',
              },
              {
                system: 'urn:oid:2.16.840.1.113883.4.1',
                value: '***-**-1234', // SSN masked
              },
            ],
            name: [
              {
                use: 'official',
                family: 'VETERAN',
                given: ['JANE'],
              },
            ],
          }),
        },
      };

      (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFhirClient
      );

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('chat-page')).toBeInTheDocument();
      });

      // Verify patient was set with VA-specific data
      expect(mockSetPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          icn: 'ICN1234567890V123456',
          sta3n: '673',
          duz: 'DUZ1234567',
          firstName: 'JANE',
          lastName: 'VETERAN',
        })
      );
    });

    it('should handle different VA station numbers', async () => {
      const testStations = ['673', '442', '558', '612'];

      // Use Promise.all to avoid await in loop
      await Promise.all(
        testStations.map(async (sta3n) => {
          vi.clearAllMocks();

          const launchContext = {
            patient: 'ICN9876543210V654321',
            sta3n,
            duz: 'DUZ9876543',
          };
          const encodedLaunch = btoa(JSON.stringify(launchContext));

          window.location.search = `?launch=${encodedLaunch}&iss=https://api.example.com/services/fhir/v0/r4`;

          const mockFhirClient = {
            patient: {
              read: vi.fn().mockResolvedValue({
                resourceType: 'Patient',
                id: '9876543210V654321',
                name: [{ family: 'TEST', given: ['PATIENT'] }],
              }),
            },
          };

          (FHIR.oauth2.init as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockFhirClient
          );

          const { unmount } = render(
            <BrowserRouter>
              <App />
            </BrowserRouter>
          );

          await waitFor(() => {
            expect(mockSetPatient).toHaveBeenCalled();
          });

          expect(mockSetPatient).toHaveBeenCalledWith(
            expect.objectContaining({
              sta3n,
            })
          );

          unmount();
        })
      );
    });
  });
});
