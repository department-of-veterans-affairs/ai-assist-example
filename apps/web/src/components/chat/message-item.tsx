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
    <div className="flex flex-col">
      <div
        className={cn('my-2 flex', isUser ? 'justify-start' : 'justify-end')}
      >
        <div className="flex max-w-tablet flex-col">
          <div
            className={cn(
              'rounded px-3 py-2',
              isUser
                ? 'bg-primary-dark text-white'
                : 'ml-12 max-w-[75vw] bg-base-lightest'
            )}
          >
            <div className={cn(isUser ? 'flex items-center' : '')}>
              {isUser && <UserAvatar inline />}
              <MessageContent content={messageContent} isUser={isUser} />
              {!isUser && (
                <MessageFeedback
                  className="mt-1"
                  messageId={message.id}
                  onCopy={() => {
                    navigator.clipboard.writeText(messageContent);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
