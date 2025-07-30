import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageThread } from '@/components/chat/message-thread';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
    useChat({
      api: '/api/chat',
    });

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
