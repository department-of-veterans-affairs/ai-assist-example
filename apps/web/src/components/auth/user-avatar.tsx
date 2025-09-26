import { clsx } from 'clsx';
import { useCurrentUser } from '@/hooks/use-current-user';

interface UserAvatarProps {
  inline?: boolean;
}

export function UserAvatar({ inline = false }: UserAvatarProps) {
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
      className={clsx(
        'radius-pill flex-align-center flex-justify-center cursor-pointer border-0 bg-white font-body-sm text-primary-darker hover:opacity-90',
        inline
          ? 'display-inline-flex min-height-4 min-width-4 width-4 height-4 margin-right-1'
          : 'display-flex width-5 height-5 min-width-5 min-height-5 text-bold'
      )}
      onClick={() => {
        if (inline) {
          return;
        }
        // TODO: Implement user menu dropdown
      }}
      type="button"
    >
      {initials}
    </button>
  );
}
