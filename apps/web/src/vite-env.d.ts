/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    env: {
      HOST_ENV: string;
      PUBLIC_URL: string;
      AUTH_CLIENT_ID: string;
      AUTH_SCOPES: string;
      AUTH_REDIRECT_URI: string;
      AUTH_PKCE_MODE: string;
      AUTH_ISS?: string;
      SMART_CONTAINER_URL: string;
      FEATURE_FLAGS?: {
        fhirAuth?: boolean;
      };
      API_URL?: string;
    };
  }
}
