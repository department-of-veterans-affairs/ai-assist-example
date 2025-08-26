import '@testing-library/jest-dom';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    search: '',
  },
  writable: true,
});

// Mock import.meta.env - using actual VA configuration values
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_AUTH_CLIENT_ID: 'Lighthouse_NP',
    VITE_AUTH_SCOPES: 'launch fhirUser openid profile patient/Patient.read',
    VITE_AUTH_REDIRECT_URI: 'index.html',
    VITE_AUTH_PKCE_MODE: 'unsafeV1',
    VITE_API_URL: 'http://localhost:8001',
    VITE_SMART_CONTAINER_URL: 'https://dev.cds.med.example.com/smart-container/',
    MODE: 'test',
    NODE_ENV: 'test',
  },
  writable: true,
});
