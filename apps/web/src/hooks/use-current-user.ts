import { useQuery } from '@tanstack/react-query';
import type { CurrentUser } from '@/types/user';

/**
 * Fetch current user information from the /me endpoint
 */
async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetch('/api/me');

  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }

  return response.json();
}

/**
 * Hook to get current user information with caching
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });
}
