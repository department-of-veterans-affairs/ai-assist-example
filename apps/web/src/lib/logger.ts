import { datadogLogs } from '@datadog/browser-logs';
import { getEnvVar } from '@/utils/helpers';

export function initDatadogLogger(): void {
  datadogLogs.init({
    clientToken: 'pub5f3423994f8b35fd22f532c983911e89',
    site: 'ddog-gov.com',
    service: 'ai-assist',
    env: getEnvVar('VITE_HOST_ENV'),
    version: '1.0.0', // TODO: get this from the build
    forwardErrorsToLogs: true,
    forwardReports: 'all',
    sessionSampleRate: 100,
  });

  datadogLogs.logger.setHandler(['http', 'console']);
  datadogLogs.setGlobalContextProperty('host', window.location.host);
}
