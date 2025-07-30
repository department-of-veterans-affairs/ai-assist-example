import type { Message } from '@ai-sdk/react';
import clsx from 'clsx';
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
          'display-flex',
          isUser ? 'flex-justify-end' : 'flex-justify-start'
        )}
      >
        <div className="display-flex max-width-tablet flex-column">
          <div
            className={clsx(
              'padding-3 radius-md',
              isUser
                ? 'bg-primary text-white'
                : 'bg-base-lightest text-base-darkest'
            )}
          >
            <div className="font-body-md">
              <MessageContent content={messageContent} isUser={isUser} />
            </div>
          </div>
          {!isUser && (
            <MessageFeedback
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
