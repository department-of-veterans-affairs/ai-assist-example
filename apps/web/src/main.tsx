import './styles/main.css';

import FHIR from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app';
import { FhirClientProvider } from './providers/fhir-client-provider';
import { getEnvVar } from './utils/helpers';
import { setupMessageEventListener } from './utils/message-event-handlers';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

function renderApp(client: Client | undefined) {
  // Setup message listener for CDS Console communication
  setupMessageEventListener();

  root.render(
    <StrictMode>
      <BrowserRouter>
        <FhirClientProvider client={client}>
          <App />
        </FhirClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

// Check if we have OAuth callback or launch parameters
const urlParams = new URLSearchParams(window.location.search);
const launch = urlParams.get('launch');
const iss = urlParams.get('iss');
const code = urlParams.get('code');
const state = urlParams.get('state');

// biome-ignore lint/suspicious/noConsole: Debugging URL parameters
console.log('Full URL:', window.location.href);
// biome-ignore lint/suspicious/noConsole: Debugging URL parameters
console.log('All URL params:', Object.fromEntries(urlParams));
// biome-ignore lint/suspicious/noConsole: Debugging URL parameters
console.log('SMART params:', { launch, iss, code, state });

// Handle both initial SMART launch and OAuth callback
if ((launch && iss) || (code && state)) {
  // biome-ignore lint/suspicious/noConsole: Debugging SMART flow
  console.log('Detected SMART flow - initializing FHIR client...');

  // Let FHIR client handle the OAuth flow automatically
  FHIR.oauth2
    .init({
      clientId: getEnvVar('VITE_AUTH_CLIENT_ID'),
      scope: getEnvVar('VITE_AUTH_SCOPES'),
      redirectUri: getEnvVar('VITE_AUTH_REDIRECT_URI', 'index.html'),
      pkceMode: getEnvVar('VITE_AUTH_PKCE_MODE', 'unsafeV1') as
        | 'ifSupported'
        | 'required'
        | 'disabled'
        | 'unsafeV1',
      iss: iss || 'https://launch.smarthealthit.org/v/r4/fhir', // Default for SMART launcher
      completeInTarget: true,
    })
    .then(
      (client: Client) => {
        // biome-ignore lint/suspicious/noConsole: Debugging SMART launch success
        console.log('SMART OAuth successful, client ready:', client);
        renderApp(client);
      },
      (error) => {
        // biome-ignore lint/suspicious/noConsole: Debugging SMART launch errors
        console.error('SMART OAuth failed:', error);
        renderApp(undefined);
      }
    );
} else {
  // No SMART parameters - render app normally
  // biome-ignore lint/suspicious/noConsole: Debugging local development
  console.log('No SMART parameters - running in local development mode');
  renderApp(undefined);
}
