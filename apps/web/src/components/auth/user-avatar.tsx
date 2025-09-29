import { useCurrentUser } from '@/hooks/use-current-user';
import { getUserInitials } from '@/lib/user';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  inline?: boolean;
}

const baseBadge =
  'flex items-center justify-center font-semibold uppercase leading-none tracking-wide';

export function UserAvatar({ inline = false }: UserAvatarProps) {
  const { data: user, isLoading, error } = useCurrentUser();

  const initials = getUserInitials(user?.user_info);

  const renderBadge = (className: string, content: string) => (
    <div aria-hidden="true" className={cn(baseBadge, className)}>
      {content}
    </div>
  );

  if (inline) {
    const inlineClasses =
      'mr-2 size-8 rounded-full bg-white text-xs text-primary-darker';

    if (isLoading) {
      return renderBadge(inlineClasses, '...');
    }

    if (error || !user?.authenticated || !user.user_info) {
      return renderBadge(inlineClasses, 'VU');
    }

    return renderBadge(inlineClasses, initials);
  }

  if (isLoading) {
    return renderBadge(
      'h-12 w-12 rounded-full bg-base-lighter text-base-dark',
      '...'
    );
  }

  if (error || !user?.authenticated || !user.user_info) {
    return renderBadge(
      'h-12 w-12 rounded-full bg-base-lighter text-base-dark',
      'VU'
    );
  }

  return (
    <button
      aria-label={`User menu for ${user.user_info.email}`}
      className={cn(
        baseBadge,
        'h-12 w-12 rounded-full border border-base-light bg-white text-primary transition hover:bg-primary hover:text-white'
      )}
      onClick={() => {
        // TODO: Implement user menu dropdown
      }}
      type="button"
    >
      {initials}
    </button>
  );
}
