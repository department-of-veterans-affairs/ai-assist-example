import type { Message } from '@ai-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  isAtBottom: boolean;
}

export function useChatScroll(
  messages: Message[],
  isLoading?: boolean
): UseChatScrollReturn {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const lastMessageIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 50; // 50px threshold
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;

      setIsAtBottom(atBottom);
      // Enable auto-scroll if user scrolls to bottom
      if (atBottom) {
        setIsAutoScroll(true);
      }
    }
  }, []);

  // Auto-scroll when new messages arrive or content changes
  useEffect(() => {
    const lastMessage = messages.at(-1);
    const currentLastId = lastMessage?.id || null;

    // Also track the content to detect streaming updates
    const lastMessageContent =
      lastMessage?.parts
        ?.filter((p) => p.type === 'text')
        ?.map((p) => p.text)
        ?.join('') || '';

    // Check if we have a new message or content update
    if (currentLastId !== lastMessageIdRef.current || lastMessageContent) {
      lastMessageIdRef.current = currentLastId;

      if (isAutoScroll && scrollRef.current) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      }
    }
  }, [messages, scrollToBottom, isAutoScroll]);

  // Scroll while streaming
  useEffect(() => {
    if (isLoading && isAutoScroll && scrollRef.current) {
      const interval = setInterval(() => {
        scrollToBottom();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, isAutoScroll, scrollToBottom]);

  // Set up scroll listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, {
        passive: true,
      });
      // Initial scroll to bottom
      scrollToBottom();

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, scrollToBottom]);

  // Disable auto-scroll when user scrolls up
  useEffect(() => {
    if (!isAtBottom) {
      setIsAutoScroll(false);
    }
  }, [isAtBottom]);

  return {
    scrollRef,
    scrollToBottom,
    isAtBottom,
  };
}
