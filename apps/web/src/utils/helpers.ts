// Helper to get and validate required environment variables
export function getEnvVar(name: string, fallback?: string): string {
  // Check window.env first (production config from S3), then import.meta.env (local dev)
  const windowEnv =
    (window as unknown as { env: Record<string, string> }).env || {};
  const value = windowEnv[name] ?? import.meta.env[name] ?? fallback;

  if (typeof value === 'undefined' || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
