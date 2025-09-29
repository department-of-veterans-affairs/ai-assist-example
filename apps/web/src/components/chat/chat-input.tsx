import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep focus on textarea
  useEffect(() => {
    // Focus on mount
    textareaRef.current?.focus();
  }, []);

  // Refocus after sending message
  useEffect(() => {
    if (!isLoading && input === '') {
      textareaRef.current?.focus();
    }
  }, [isLoading, input]);

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);

    // Resize textarea after content changes
    const textarea = e.target;
    textarea.style.height = '44px'; // Start with minimum height
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        // Create a synthetic form event
        const form = e.currentTarget.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  return (
    <div className="m-3 rounded-lg bg-white px-4 pt-4 pb-3">
      <form className="mx-auto max-w-desktop" onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center rounded border p-4 transition-colors',
            isFocused ? 'border-primary-light' : 'border-base-light'
          )}
        >
          <Textarea
            aria-describedby="chat-input-instructions"
            aria-label="Chat message input"
            className="min-h-11 flex-1 border-0 bg-transparent px-0 py-0 shadow-none placeholder:text-base-light focus:border-0 focus:outline-none focus:ring-0"
            disabled={isLoading}
            id="chat-input"
            name="message"
            onBlur={() => setIsFocused(false)}
            onChange={handleTextareaChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            ref={textareaRef}
            rows={1}
            spellCheck
            style={{ resize: 'none' }}
            value={input}
          />
          <Button
            aria-label={isLoading ? 'Sending message' : 'Send message'}
            className="h-11 shrink-0 rounded-none rounded-r border-0 border-l"
            disabled={!input.trim() || isLoading}
            type="submit"
            variant="secondary"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>

        <span
          aria-live="polite"
          className="mt-2 block text-center text-base-light tracking-wide"
          id="chat-input-instructions"
        >
          AI-generated content may be incorrect
        </span>
      </form>
    </div>
  );
}
