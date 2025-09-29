import type { Message } from '@ai-sdk/react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '../auth/user-avatar';
import { MessageContent } from './message-content';
import { MessageFeedback } from './message-feedback';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  const messageContent =
    message.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n') || '';

  return (
    <div className="my-3 flex">
      <div
        className={cn('flex w-full', isUser ? 'justify-start' : 'justify-end')}
      >
        <div
          className={cn(
            'flex max-w-3xl flex-col gap-2',
            !isUser && 'items-start'
          )}
        >
          <div
            className={cn(
              'rounded-md px-6 py-4 shadow-1',
              isUser
                ? 'flex items-center gap-3 bg-primary-dark text-white'
                : 'ml-12 max-w-[75vw] bg-base-lightest text-base-darker'
            )}
          >
            {isUser && <UserAvatar inline />}
            <div className="text-base leading-relaxed">
              <MessageContent content={messageContent} isUser={isUser} />
            </div>
          </div>
          {!isUser && (
            <MessageFeedback
              className="pt-2 pl-12"
              messageId={message.id}
              onCopy={() => {
                navigator.clipboard.writeText(messageContent);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
