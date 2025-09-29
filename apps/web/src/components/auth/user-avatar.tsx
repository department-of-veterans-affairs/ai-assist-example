import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  inline?: boolean;
}

const baseBadge =
  'flex items-center justify-center font-semibold uppercase leading-none tracking-wide';

export function UserAvatar({ inline = false }: UserAvatarProps) {
  const { data: user, isLoading, error } = useCurrentUser();

  const initials = user?.user_info
    ? `${user.user_info.first_name?.[0] ?? ''}${
        user.user_info.last_name?.[0] ?? ''
      }`.trim() || 'VU'
    : 'VU';

  const renderBadge = (className: string, content: string) => (
    <div aria-hidden="true" className={cn(baseBadge, className)}>
      {content}
    </div>
  );

  if (inline) {
    const inlineClasses = 'h-10 w-10 rounded-lg bg-primary text-white';

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
