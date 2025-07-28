import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './index.css';

// VACDS styles - imported directly as CSS (no SCSS needed)
import '@department-of-veterans-affairs/clinical-design-system/dist/core/css/utility-classes.css';
import '@department-of-veterans-affairs/clinical-design-system/dist/core/css/typography.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
