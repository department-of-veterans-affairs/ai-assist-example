import './styles/main.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app';
import { setupMessageEventListener } from './utils/message-event-handlers';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

setupMessageEventListener();

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
