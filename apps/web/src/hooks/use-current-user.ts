import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import type { CurrentUser } from '@/types/user';

/**
 * Fetch current user information from the /me endpoint
 */
async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetchApi('me');

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
