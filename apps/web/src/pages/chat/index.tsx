import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageThread } from '@/components/chat/message-thread';
import { createApiUrl } from '@/lib/api';
import { usePatientStore } from '@/stores';

export default function ChatPage() {
  const patient = usePatientStore((state) => state.patient);

  const { messages, input, handleInputChange, handleSubmit, error, status } =
    useChat({
      api: createApiUrl('chat'),
      body: {
        patient_dfn: patient?.dfn,
      },
    });

  const isLoading = status === 'streaming';

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
