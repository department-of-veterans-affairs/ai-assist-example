import './styles/main.css';

import FHIR from 'fhirclient';
import type Client from 'fhirclient/lib/Client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app';
import { Config } from './config';
import { FhirClientProvider } from './providers/fhir-client-provider';
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

if (import.meta.env.DEV) {
  renderApp(undefined);
} else {
  FHIR.oauth2.init(Config).then(
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
}
