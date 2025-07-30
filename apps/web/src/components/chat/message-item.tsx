import type { Message } from '@ai-sdk/react';
import clsx from 'clsx';
import { MessageContent } from './message-content';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  // Extract text content from message parts
  const messageContent =
    message.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n') || '';

  return (
    <div
      className={clsx(
        'display-flex',
        isUser ? 'flex-justify-end' : 'flex-justify-start'
      )}
    >
      <div
        className={clsx(
          'padding-3 radius-md max-width-tablet',
          isUser
            ? 'bg-primary text-white'
            : 'bg-base-lightest text-base-darkest'
        )}
      >
        <div className="font-body-md">
          <MessageContent content={messageContent} isUser={isUser} />
        </div>
      </div>
    </div>
  );
}
