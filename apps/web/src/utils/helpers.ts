// Helper to get and validate required environment variables
export function getEnvVar(name: string, fallback?: string): string {
  const value = import.meta.env[name] ?? fallback;
  if (typeof value === 'undefined' || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
