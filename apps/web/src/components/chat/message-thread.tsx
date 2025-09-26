import type { Message } from '@ai-sdk/react';
import { Alert } from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { LoadingIndicator } from './loading-indicator';
import { MessageItem } from './message-item';

interface MessageThreadProps {
  messages: Message[];
  isLoading: boolean;
  error?: Error;
}

export function MessageThread({
  messages,
  isLoading,
  error,
}: MessageThreadProps) {
  const { scrollRef } = useChatScroll(messages, isLoading);

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-width-desktop margin-x-auto padding-3">
          <Alert className="margin-bottom-3" type="error">
            An error occurred: {error.message}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" ref={scrollRef}>
      <div className="max-width-desktop margin-x-auto padding-3">
        {messages.length > 0 && (
          <div className="display-flex flex-column">
            {messages.map((message, index) => (
              <div
                className={clsx(index > 0 && 'margin-top-2')}
                key={message.id}
              >
                <MessageItem message={message} />
              </div>
            ))}
            {isLoading && (
              <div className="margin-top-2">
                <LoadingIndicator />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
