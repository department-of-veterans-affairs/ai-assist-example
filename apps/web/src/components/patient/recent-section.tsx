import {
  Button,
  Icon,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useState } from 'react';
import HistoryIcon from '@/assets/icons/history.svg';
import SwapIcon from '@/assets/icons/swap.svg';
import VertIcon from '@/assets/icons/vert.svg';

// Mock data for past conversations
const mockConversations = [
  {
    id: 1,
    name: 'Sarah Brown',
    time: 'Jul 31, 2025, 6:39am',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Emily Johnson',
    time: 'Jul 30, 2025, 6:39am',
    isFavorite: true,
  },
  {
    id: 3,
    name: 'Jordan Taylor',
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
    <div className="padding-2 width-full border-base-lighter">
      <div className="display-flex width-full flex-align-center">
        <div className="display-flex flex-1 flex-align-center gap-2">
          <img
            alt="Past Conversations icon"
            className="width-4 height-4 flex-shrink-0"
            src={HistoryIcon}
          />
          <span className="padding-left-1 font-body-lg text-bold">
            Past Conversations
          </span>
        </div>
        <Icon
          className="margin-left-auto cursor-pointer text-base-dark transition-transform"
          onClick={() => setExpanded(!expanded)}
          size={3}
          type={expanded ? 'ExpandLess' : 'ExpandMore'}
        />
      </div>

      {expanded && (
        <div className="padding-left-3">
          {conversations.map((conversation) => (
            <div
              className="padding-2 margin-bottom-1 display-flex radius-md flex-align-center flex-justify-space-between cursor-pointer border-base-lighter border-bottom hover:bg-base-lighter"
              key={conversation.id}
            >
              <div className="minw-0 flex-1">
                <div className="display-flex flex-align-center gap-1 font-body-sm text-no-wrap text-primary text-underline">
                  <img
                    alt="Swap Icon"
                    className="width-2 height-2 flex-shrink-0"
                    src={SwapIcon}
                  />
                  <span className="text-truncate">
                    Switch to {conversation.name}
                  </span>
                </div>
                <div className="margin-left-2 font-body-xs text-base">
                  Created: {conversation.time}
                </div>
              </div>
              <div className="display-flex flex-align-center">
                {conversation.isFavorite ? (
                  <Button
                    aria-label="Remove from favorites"
                    className="padding-05"
                    onClick={() => toggleFavorite(conversation.id)}
                    type="button"
                    unstyled
                  >
                    <Icon size={3} type="Favorite" />
                  </Button>
                ) : (
                  <Button
                    aria-label="More options"
                    className="padding-05 text-base hover:text-primary"
                    type="button"
                    unstyled
                  >
                    <img
                      alt="More options"
                      className="width-3 height-3"
                      src={VertIcon}
                    />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
