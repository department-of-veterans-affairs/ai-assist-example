window.env = {
  HOST_ENV: 'dev',
  PUBLIC_URL: '/ai-assist/',
  AUTH_CLIENT_ID: 'Lighthouse_Sandbox_3_NP',
  AUTH_SCOPES: 'launch fhirUser openid profile patient/Patient.read',
  AUTH_REDIRECT_URI: 'index.html',
  AUTH_PKCE_MODE: 'required',
  AUTH_ISS: 'https://launch.smarthealthit.org/v/r4/fhir',
  SMART_CONTAINER_URL: 'https://dev.cds.med.example.com/smart-container/',
  FEATURE_FLAGS: {
    fhirAuth: true,
  },
};
