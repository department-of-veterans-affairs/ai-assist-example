/**
 * Get the API base URL based on the current environment
 * - Local development: '/api' (proxied by Vite dev server)
 * - Deployed environments: Uses VITE_API_URL + '/api'
 */
function getApiBaseUrl(): string {
  // Use Vite's environment variable for API URL (build-time configuration)
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    // In deployed environments, append /api to the service URL
    return `${apiUrl}/api`;
  }

  // Local development: use relative path that gets proxied
  return '/api';
}

/**
 * Create a full API URL for the given endpoint
 * @param endpoint - API endpoint (e.g., 'me', 'chat', '/me', '/chat')
 * @returns Full API URL
 */
export function createApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Enhanced fetch wrapper that automatically handles API base URL
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Fetch promise
 */
export function fetchApi(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = createApiUrl(endpoint);
  return fetch(url, options);
}
