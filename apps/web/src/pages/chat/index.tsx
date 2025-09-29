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
        patient: patient
          ? {
              icn: patient.icn || patient.id, // ICN is the primary identifier for MCP
              dfn: patient.dfn, // Keep for backward compatibility
              station: patient.station,
              firstName: patient.firstName,
              lastName: patient.lastName,
            }
          : null,
      },
    });

  const isLoading = status === 'streaming';

  return (
    <div className="flex h-full flex-col">
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
