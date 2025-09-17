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
  clientId: string;
  scope: string;
  redirectUri: string;
  pkceMode: AuthPKCEMode;
  iss: string;
  smartOnFhirContainerUrl: string;
  completeInTarget: boolean;
  featureFlags: FeatureFlags;
}

export const CONFIG: Config = {
  hostEnv: window.env.HOST_ENV,
  clientId: window.env.AUTH_CLIENT_ID,
  scope: window.env.AUTH_SCOPES,
  redirectUri: window.env.AUTH_REDIRECT_URI,
  pkceMode: window.env.AUTH_PKCE_MODE as AuthPKCEMode,
  iss: window.env.AUTH_ISS || 'https://launch.smarthealthit.org/v/r4/fhir',
  smartOnFhirContainerUrl: window.env.SMART_CONTAINER_URL,
  completeInTarget: true,
  featureFlags: window.env.FEATURE_FLAGS || { fhirAuth: true },
} as const;
