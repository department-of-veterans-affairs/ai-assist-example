import './styles/main.css';

import FHIR from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app';
import { CONFIG } from './config';
import { initDatadogLogger } from './lib/logger';
import { FhirClientProvider } from './providers/fhir-client-provider';
import { setupMessageEventListener } from './utils/message-event-handlers';

// Initialize Datadog logger in production
if (!import.meta.env.DEV) {
  initDatadogLogger();
}

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
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <FhirClientProvider client={client}>
          <App />
        </FhirClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

// // Wait for config to load before initializing
// async function initializeApp() {
//   // Wait for config loading promise if it exists
//   if ((window as unknown as { configReady: Promise<void> }).configReady) {
//     await (window as unknown as { configReady: Promise<void> }).configReady;
//   }

//   // Check if we have OAuth callback or launch parameters
//   const urlParams = new URLSearchParams(window.location.search);
//   const launch = urlParams.get('launch');
//   const iss = urlParams.get('iss') || CONFIG.iss;
//   const code = urlParams.get('code');
//   const state = urlParams.get('state');

//   // REMOVE ME
//   console.log('**** PARAMS ****', {
//     launch,
//     iss: iss || CONFIG.iss,
//     code,
//     state,
//     url: window.location.href,
//   });
//   console.log('**** CONFIG ****', CONFIG);
//   console.log(
//     '**** API URL ****',
//     import.meta.env.VITE_API_URL || window.env.API_URL
//   );

//   // Handle both initial SMART launch and OAuth callback
//   if ((launch && iss) || (code && state)) {
//     console.log('Detected SMART flow - initializing FHIR client...');

//     // Let FHIR client handle the OAuth flow automatically
//     FHIR.oauth2
//       .init({
//         ...CONFIG,
//         iss,
//       })
//       .then(
//         (client: Client) => {
//           console.log('SMART OAuth successful, client ready:', client);
//           renderApp(client);
//         },
//         (error) => {
//           console.error('SMART OAuth failed:', error);
//           renderApp(undefined);
//         }
//       );
//   } else {
//     // No SMART parameters - render app normally

//     console.log('No SMART parameters - running in local development mode');
//     renderApp(undefined);
//   }
// }

// // Start the app
// initializeApp();

if (CONFIG.featureFlags?.fhirAuth) {
  const urlParams = new URLSearchParams(window.location.search);
  const launch = urlParams.get('launch');
  const iss = urlParams.get('iss') || CONFIG.iss;
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  // REMOVE ME
  console.log('**** PARAMS ****', {
    launch,
    iss,
    code,
    state,
    url: window.location.href,
  });
  console.log('**** CONFIG ****', CONFIG);
  console.log(
    '**** API URL ****',
    import.meta.env.VITE_API_URL || window.env.API_URL
  );
  FHIR.oauth2.init({ ...CONFIG, iss }).then(
    (client: Client) => {
      renderApp(client);
    },
    (error) => {
      console.error(error);
      root.render(
        <>
          <br />
          <pre>{error.stack}</pre>
        </>
      );
    }
  );
} else {
  renderApp(undefined);
}
