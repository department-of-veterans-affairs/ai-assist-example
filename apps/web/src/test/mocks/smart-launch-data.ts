import type { Patient as FHIRPatient } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { vi } from 'vitest';

// VA-specific launch contexts for testing
export const mockLaunchContexts = {
  valid: {
    patient: 'ICN1234567890V123456',
    sta3n: '673',
    duz: 'DUZ1234567',
  },
  validAlternate: {
    patient: 'ICN9876543210V654321',
    sta3n: '442',
    duz: 'DUZ9876543',
  },
  missingPatient: {
    sta3n: '673',
    duz: 'DUZ1234567',
  },
  missingSta3n: {
    patient: 'ICN1234567890V123456',
    duz: 'DUZ1234567',
  },
  missingDuz: {
    patient: 'ICN1234567890V123456',
    sta3n: '673',
  },
  empty: {},
};

// Encoded launch parameters
export const encodedLaunchParams = {
  valid: btoa(JSON.stringify(mockLaunchContexts.valid)),
  validAlternate: btoa(JSON.stringify(mockLaunchContexts.validAlternate)),
  invalidBase64: 'invalid-base64!@#',
  invalidJson: btoa('not-valid-json{'),
  missingPatient: btoa(JSON.stringify(mockLaunchContexts.missingPatient)),
  missingSta3n: btoa(JSON.stringify(mockLaunchContexts.missingSta3n)),
  missingDuz: btoa(JSON.stringify(mockLaunchContexts.missingDuz)),
  empty: btoa(JSON.stringify(mockLaunchContexts.empty)),
};

// Mock VA FHIR ISS endpoints
export const mockIssEndpoints = {
  production: 'https://api.example.com/services/fhir/v0/r4',
  sandbox: 'https://sandbox-api.example.com/services/fhir/v0/r4',
  local: 'http://localhost:8080/fhir/r4',
};

// Mock FHIR Patient resources
export const mockPatients: Record<string, FHIRPatient> = {
  standard: {
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
  },
  withMultipleIdentifiers: {
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
        value: '***-**-1234',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'VETERAN',
        given: ['JANE', 'MARIE'],
      },
    ],
    birthDate: '1955-03-22',
    gender: 'female',
  },
  noName: {
    resourceType: 'Patient',
    id: '9876543210V654321',
    identifier: [
      {
        system: 'http://example.com/systems/ICN',
        value: '9876543210V654321',
      },
    ],
  },
  multipleName: {
    resourceType: 'Patient',
    id: '1111111111V111111',
    identifier: [
      {
        system: 'http://example.com/systems/ICN',
        value: '1111111111V111111',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'SMITH',
        given: ['ROBERT', 'JAMES'],
      },
      {
        use: 'nickname',
        family: 'SMITH',
        given: ['BOB'],
      },
    ],
  },
};

// Mock FHIR Client factory
export function createMockFhirClient(
  patientData: FHIRPatient = mockPatients.standard,
  options: {
    shouldFailPatientRead?: boolean;
    patientReadError?: unknown;
  } = {}
): Client {
  const mockPatientRead = vi.fn();

  const mockClient = {
    patient: {
      read: mockPatientRead,
    },
    state: {
      tokenResponse: {
        access_token: 'mock-access-token',
        patient: patientData.id,
        scope: 'patient/*.read launch',
      },
      serverUrl: mockIssEndpoints.sandbox,
    },
    getPatientId: () => patientData.id,
    getFhirVersion: () => 4,
  } as unknown as Client;

  if (options.shouldFailPatientRead) {
    mockPatientRead.mockRejectedValue(
      options.patientReadError || new Error('Patient read failed')
    );
  } else {
    mockPatientRead.mockResolvedValue(patientData);
  }

  return mockClient;
}

// Mock errors for testing error scenarios
export const mockErrors = {
  oauth: {
    unauthorized: {
      status: 401,
      statusText: 'Unauthorized',
      message: 'Invalid or expired token',
    },
    forbidden: {
      status: 403,
      statusText: 'Forbidden',
      message: 'Insufficient permissions',
    },
    notFound: {
      status: 404,
      statusText: 'Not Found',
      message: 'Patient not found',
    },
    serverError: {
      status: 500,
      statusText: 'Internal Server Error',
      message: 'FHIR server error',
    },
  },
  network: new Error('Network error: Failed to fetch'),
  timeout: new Error('Request timeout'),
  invalidToken: new Error('Invalid authentication token'),
};

// Test URL parameter combinations
export const testUrlParams = {
  complete: (launch: string, iss: string) =>
    `?launch=${launch}&iss=${encodeURIComponent(iss)}`,
  missingLaunch: (iss: string) => `?iss=${encodeURIComponent(iss)}`,
  missingIss: (launch: string) => `?launch=${launch}`,
  empty: '',
  withExtraParams: (launch: string, iss: string) =>
    `?launch=${launch}&iss=${encodeURIComponent(iss)}&app_context=test&debug=true`,
};

// Environment variable configurations for testing
export const testEnvConfigs = {
  complete: {
    VITE_AUTH_CLIENT_ID: 'test-client-id',
    VITE_AUTH_SCOPES: 'patient/*.read launch',
    VITE_AUTH_REDIRECT_URI: 'http://localhost:3000/callback',
    VITE_AUTH_PKCE_MODE: 'unsafeV1',
  },
  minimal: {
    VITE_AUTH_CLIENT_ID: 'test-client-id',
    VITE_AUTH_SCOPES: 'patient/*.read launch',
    // Missing redirect URI and PKCE mode - should use defaults
  },
  missingRequired: {
    // Missing client ID - should cause error
    VITE_AUTH_SCOPES: 'patient/*.read launch',
    VITE_AUTH_REDIRECT_URI: 'http://localhost:3000/callback',
  },
  production: {
    VITE_AUTH_CLIENT_ID: 'va-prod-client-id',
    VITE_AUTH_SCOPES: 'patient/*.read launch openid profile',
    VITE_AUTH_REDIRECT_URI: 'https://app.example.com/callback',
    VITE_AUTH_PKCE_MODE: 'required',
  },
};

// Helper to simulate SMART launch URL
export function createSmartLaunchUrl(
  launch: string = encodedLaunchParams.valid,
  iss: string = mockIssEndpoints.sandbox
): string {
  return `http://localhost:3000/${testUrlParams.complete(launch, iss)}`;
}

// Helper to create test scenarios
export interface TestScenario {
  name: string;
  launch: string;
  iss: string;
  patient: FHIRPatient;
  shouldSucceed: boolean;
  expectedError?: string;
}

export const testScenarios: TestScenario[] = [
  {
    name: 'Standard VA patient launch',
    launch: encodedLaunchParams.valid,
    iss: mockIssEndpoints.production,
    patient: mockPatients.standard,
    shouldSucceed: true,
  },
  {
    name: 'Patient with multiple identifiers',
    launch: encodedLaunchParams.valid,
    iss: mockIssEndpoints.production,
    patient: mockPatients.withMultipleIdentifiers,
    shouldSucceed: true,
  },
  {
    name: 'Patient without name',
    launch: encodedLaunchParams.validAlternate,
    iss: mockIssEndpoints.sandbox,
    patient: mockPatients.noName,
    shouldSucceed: true,
  },
  {
    name: 'Invalid base64 launch parameter',
    launch: encodedLaunchParams.invalidBase64,
    iss: mockIssEndpoints.production,
    patient: mockPatients.standard,
    shouldSucceed: false,
    expectedError: 'Invalid launch parameter',
  },
  {
    name: 'Missing patient in launch context',
    launch: encodedLaunchParams.missingPatient,
    iss: mockIssEndpoints.production,
    patient: mockPatients.standard,
    shouldSucceed: false,
    expectedError: 'missing or invalid patient',
  },
];
