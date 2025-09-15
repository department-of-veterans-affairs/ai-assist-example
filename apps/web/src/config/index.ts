export type Environment = {
  AUTH_CLIENT_ID?: string;
  AUTH_SCOPES?: string;
  AUTH_REDIRECT_URI?: string;
  AUTH_PKCE_MODE?: 'ifSupported' | 'required' | 'disabled' | 'unsafeV1';
  AUTH_ISS?: string;
  HOST_ENV: string;
  SMART_ON_FHIR_CONTAINER_URL: string;
};

declare const env: Environment;

// Get environment variables with fallbacks for development
function getEnv(): Environment {
  // In development mode, provide default values
  if (import.meta.env.DEV) {
    return {
      HOST_ENV: 'dev',
      AUTH_CLIENT_ID: 'Lighthouse_Sandbox_3_NP',
      AUTH_SCOPES: 'launch fhirUser openid profile patient/Patient.read',
      AUTH_REDIRECT_URI: 'index.html',
      AUTH_PKCE_MODE: 'unsafeV1',
      SMART_ON_FHIR_CONTAINER_URL:
        'https://dev.cds.med.example.com/smart-container/',
    };
  }

  // In production, use the env object from window (loaded from config.js)
  return (window as { env?: Environment }).env || ({} as Environment);
}

const environment = getEnv();

export const Config = {
  hostEnv: environment.HOST_ENV,
  clientId: environment.AUTH_CLIENT_ID,
  scope: environment.AUTH_SCOPES,
  redirectUri: environment.AUTH_REDIRECT_URI,
  pkceMode: environment.AUTH_PKCE_MODE,
  iss: environment.AUTH_ISS,
  smartOnFhirContainerUrl: environment.SMART_ON_FHIR_CONTAINER_URL,
  completeInTarget: true,
} as const;

export type Config = typeof Config;
