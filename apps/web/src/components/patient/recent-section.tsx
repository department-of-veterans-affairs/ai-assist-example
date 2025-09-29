import {
  ChevronDown,
  ChevronUp,
  History,
  Repeat,
  Star,
  StarOff,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Mock data for past conversations
const mockConversations = [
  {
    id: 1,
    name: 'Test Patient 1',
    time: 'Jul 31, 2025, 6:39am',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Test Patient 2',
    time: 'Jul 30, 2025, 6:39am',
    isFavorite: true,
  },
  {
    id: 3,
    name: 'Test Patient 3',
    time: 'Jul 29, 2025, 6:39am',
    isFavorite: false,
  },
];

export function RecentSection() {
  const [expanded, setExpanded] = useState(true);
  const [conversations, setConversations] = useState(mockConversations);

  const toggleFavorite = (id: number) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isFavorite: !conv.isFavorite } : conv
      )
    );
  };

  return (
    <div className="w-full border border-base-lighter bg-white p-4 shadow-1">
      <div className="flex w-full items-center">
        <div className="flex flex-1 items-center gap-2">
          <History aria-hidden="true" className="h-4 w-4 text-primary" />
          <span className="pl-2 font-semibold text-base-darker text-lg">
            Past Conversations
          </span>
        </div>
        <button
          aria-label={
            expanded
              ? 'Collapse past conversations'
              : 'Expand past conversations'
          }
          className="ml-auto rounded-full p-1 text-base-dark transition hover:bg-base-lightest"
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 pl-4">
          {conversations.map((conversation) => (
            <div
              className="flex cursor-pointer items-center justify-between rounded-md border border-base-lightest bg-base-lightest/40 px-4 py-3 transition hover:bg-base-lightest"
              key={conversation.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-primary text-sm">
                  <Repeat
                    aria-hidden="true"
                    className="h-3.5 w-3.5 flex-shrink-0"
                  />
                  <span className="truncate font-semibold underline">
                    Switch to {conversation.name}
                  </span>
                </div>
                <div className="pl-4 text-base text-xs">
                  Created: {conversation.time}
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  aria-label={
                    conversation.isFavorite ? 'Remove favorite' : 'Add favorite'
                  }
                  onClick={() => toggleFavorite(conversation.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {conversation.isFavorite ? (
                    <Star
                      aria-hidden="true"
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ) : (
                    <StarOff aria-hidden="true" className="h-4 w-4 text-base" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
