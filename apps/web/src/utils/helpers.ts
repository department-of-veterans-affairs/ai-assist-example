// Helper to get and validate required environment variables
export function getEnvVar(name: string, fallback?: string): string {
  // Check window.env first (production config from S3), then import.meta.env (local dev)
  const windowEnv =
    (window as unknown as { env: Record<string, string> }).env || {};
  const value = windowEnv[name] ?? import.meta.env[name] ?? fallback;

  if (typeof value === 'undefined' || value === null || value === '') {
    // Special handling for production environments where config might still be loading
    if (window.location.hostname !== 'localhost' && !windowEnv[name]) {
      console.warn(`Missing required environment variable: ${name}`);
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
