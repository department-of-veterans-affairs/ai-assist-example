import type { Message } from '@ai-sdk/react';
import { Alert } from '@/components/ui/alert';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { cn } from '@/lib/utils';
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
        <div className="mx-auto max-w-5xl p-6">
          <Alert className="mb-6" variant="error">
            An error occurred: {error.message}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" ref={scrollRef}>
      <div className="mx-auto max-w-5xl p-6">
        {messages.length > 0 && (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              <div className={cn(index > 0 && 'mt-4')} key={message.id}>
                <MessageItem message={message} />
              </div>
            ))}
            {isLoading && (
              <div className="mt-4">
                <LoadingIndicator />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
