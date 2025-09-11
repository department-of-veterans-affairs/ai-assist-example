import { useCurrentUser } from '@/hooks/use-current-user';

export function UserAvatar() {
  const { data: user, isLoading, error } = useCurrentUser();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="width-5 height-5 min-width-5 min-height-5 radius-pill display-flex flex-align-center flex-justify-center bg-gray-30">
        <span className="font-body-sm text-bold text-gray-70">...</span>
      </div>
    );
  }

  // Handle error or unauthenticated state
  if (error || !user?.authenticated || !user.user_info) {
    return (
      <div className="width-5 height-5 min-width-5 min-height-5 radius-pill display-flex flex-align-center flex-justify-center bg-gray-30">
        <span className="font-body-sm text-bold text-gray-70">VU</span>
      </div>
    );
  }

  // Generate user initials
  const initials =
    user.user_info.first_name?.[0] && user.user_info.last_name?.[0]
      ? `${user.user_info.first_name[0]}${user.user_info.last_name[0]}`
      : 'VU';

  return (
    <button
      aria-label={`User menu for ${user.user_info.email}`}
      className="width-5 height-5 min-width-5 min-height-5 radius-pill display-flex flex-align-center flex-justify-center cursor-pointer border-0 bg-white font-body-sm text-bold text-primary-darker hover:opacity-90"
      onClick={() => {
        // TODO: Implement user menu dropdown
      }}
      type="button"
    >
      {initials}
    </button>
  );
}
