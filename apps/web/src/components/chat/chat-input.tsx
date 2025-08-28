import { Button } from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

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
    <div className="padding-top-3 padding-bottom-2 padding-left-3 padding-right-3 margin-2 radius-lg border-1px border-base-lighter bg-white shadow-2">
      <form className="max-width-desktop margin-x-auto" onSubmit={handleSubmit}>
        <div className="display-flex radius-md flex-align-center border-1px border-base-light">
          <div
            // #2491FF which is 'blue-40v' is not being recognized, so using 'primary-light' instead
            //https://designsystem.digital.gov/design-tokens/color/system-tokens/
            className={clsx(
              'margin-2px margin-right-1 radius-md flex-1',
              isFocused
                ? 'border-05 border-primary-light'
                : 'border-05 border-transparent'
            )}
          >
            <textarea
              aria-describedby="chat-input-instructions"
              aria-label="Chat message input"
              className="padding-2 width-full border-0 bg-transparent font-body-md outline-0"
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
              style={{
                resize: 'none',
                minHeight: '44px',
                borderRadius: '4px 0 0 4px',
              }}
              value={input}
            />
          </div>
          <Button
            aria-label={isLoading ? 'Sending message' : 'Send message'}
            className="radius-0 border-0 border-base-light border-left-1px"
            disabled={!input.trim() || isLoading}
            type="submit"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
        <span
          aria-live="polite"
          className="display-block margin-top-1 text-center font-body-sm text-base-light"
          id="chat-input-instructions"
        >
          {isLoading
            ? 'AI is responding...'
            : 'AI-generated content may be incorrect'}
        </span>
      </form>
    </div>
  );
}
