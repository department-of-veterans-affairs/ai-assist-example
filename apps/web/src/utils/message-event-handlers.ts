import { decode } from 'js-base64';

export interface SmartOnFhirMessage {
  smartOnFhirEvent: string;
}

export interface SmartLaunchData {
  appUrlToLoad: string;
}

export const messageEventListener =
  (window: Window) =>
  (event: MessageEvent<SmartOnFhirMessage>): void => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.smartOnFhirEvent) {
      try {
        const parsedMessage: SmartLaunchData = JSON.parse(
          decode(event.data.smartOnFhirEvent)
        );

        // biome-ignore lint/suspicious/noConsole: Needed for debugging CDS Console communication
        console.log('Received incoming CDS Console message:', parsedMessage);

        // Clear session storage to avoid refreshed page picking up existing SMART client from cache
        const keyName = sessionStorage
          .getItem('SMART_KEY')
          ?.replaceAll('"', '');
        if (keyName) {
          sessionStorage.removeItem(keyName);
          sessionStorage.removeItem('SMART_KEY');
        }

        // Navigate to the new app URL with patient context
        window.location.href = parsedMessage.appUrlToLoad;
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Needed for debugging CDS Console errors
        console.error('Failed to parse SMART on FHIR message:', error);
      }
    }
  };

export const setupMessageEventListener = () => {
  const listener = messageEventListener(window);
  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
};
