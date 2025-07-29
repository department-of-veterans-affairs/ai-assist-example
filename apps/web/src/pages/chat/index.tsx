import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageThread } from '@/components/chat/message-thread';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: '/api/chat',
  });

  // Derive isLoading from the messages state
  const isLoading =
    messages.length > 0 &&
    messages.at(-1)?.role === 'assistant' &&
    messages.at(-1)?.parts.length === 0;

  return (
    <div className="display-flex height-full flex-column">
      <MessageThread error={error} isLoading={isLoading} messages={messages} />
      <ChatInput
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        input={input}
        isLoading={isLoading}
      />
    </div>
  );
}
