import type { UserInfo } from '@/types/user';

/**
 * Get user initials from user info
 * Returns first letter of first name + first letter of last name
 * Defaults to 'VU' (VA User) if names are not available
 */
export function getUserInitials(userInfo: UserInfo | null | undefined): string {
  if (!userInfo) {
    return 'VU';
  }

  const firstName = userInfo.first_name?.trim();
  const lastName = userInfo.last_name?.trim();

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName[0].toUpperCase();
  }

  if (lastName) {
    return lastName[0].toUpperCase();
  }

  return 'VU';
}
