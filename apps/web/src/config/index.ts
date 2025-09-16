import { getEnvVar } from '@/utils/helpers';

const FEATURES = {
  fhirAuth: true,
} as const;

type Feature = keyof typeof FEATURES;

export type AuthPKCEMode = 'ifSupported' | 'required' | 'disabled' | 'unsafeV1';

export type FeatureFlags = {
  [feature in Feature]?: boolean;
};

export interface Config {
  hostEnv: string;
  clientId: string | undefined;
  scope: string | undefined;
  redirectUri: string | undefined;
  pkceMode?: AuthPKCEMode;
  iss: string | undefined;
  smartOnFhirContainerUrl: string;
  completeInTarget: boolean;
  featureFlags: FeatureFlags | undefined;
}

export const CONFIG: Config = {
  hostEnv: getEnvVar('VITE_HOST_ENV', 'dev'),
  clientId: getEnvVar('VITE_AUTH_CLIENT_ID', 'Lighthouse_Sandbox_3_NP'),
  scope: getEnvVar(
    'VITE_AUTH_SCOPES',
    'launch fhirUser openid profile patient/Patient.read'
  ),
  redirectUri: getEnvVar('VITE_AUTH_REDIRECT_URI', 'index.html'),
  pkceMode: getEnvVar('VITE_AUTH_PKCE_MODE', 'unsafeV1') as AuthPKCEMode,
  iss: getEnvVar('VITE_AUTH_ISS', 'https://launch.smarthealthit.org/v/r4/fhir'),
  smartOnFhirContainerUrl: getEnvVar(
    'VITE_SMART_CONTAINER_URL',
    'https://dev.cds.med.example.com/smart-container/'
  ),
  completeInTarget: true,
  featureFlags: {
    fhirAuth: true,
  },
} as const;
