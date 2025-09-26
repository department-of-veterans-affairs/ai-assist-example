import type { Message } from '@ai-sdk/react';
import clsx from 'clsx';
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
    <div className="display-flex flex-column">
      <div
        className={clsx(
          'display-flex margin-1',
          isUser ? 'flex-justify-start' : 'flex-justify-end'
        )}
      >
        <div className="display-flex max-width-tablet flex-column">
          <div
            className={clsx(
              'padding-y-2 padding-x-3 radius-md',
              isUser
                ? 'bg-primary-dark text-white'
                : 'margin-left-6 max-width-75vw bg-base-lightest text-base-darker'
            )}
          >
            <div
              className={clsx(
                'font-body-md',
                isUser ? 'display-flex flex-align-center' : 'text-base-darkest'
              )}
            >
              {isUser && <UserAvatar inline />}
              <MessageContent content={messageContent} isUser={isUser} />
              {!isUser && (
                <MessageFeedback
                  className="margin-top-1"
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
