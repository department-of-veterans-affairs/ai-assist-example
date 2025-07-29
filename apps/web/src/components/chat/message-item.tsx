import type { Message } from '@ai-sdk/react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  // Extract text content from message parts
  const messageContent = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n');

  return (
    <div
      className={clsx(
        'display-flex',
        isUser ? 'flex-justify-end' : 'flex-justify-start'
      )}
    >
      <div
        className={clsx(
          'max-width-tablet',
          isUser ? 'margin-left-4' : 'margin-right-4'
        )}
      >
        <div
          className={clsx(
            'padding-3',
            isUser ? 'bg-primary-lightest' : 'bg-base-lightest'
          )}
        >
          <div className="display-flex flex-column flex-gap-1">
            <span
              className={clsx(
                'font-body-xs text-bold',
                isUser ? 'text-primary-darker' : 'text-base-dark'
              )}
            >
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <div className="font-body-md text-base-darkest">
              {isUser ? (
                <p className="margin-0">{messageContent}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    // Style markdown elements with VACDS classes
                    p: ({ children }) => (
                      <p className="margin-0 margin-bottom-2">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="margin-bottom-2 margin-left-3">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="margin-bottom-2 margin-left-3">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="margin-bottom-1">{children}</li>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="padding-x-1 bg-base-lightest font-mono">
                          {children}
                        </code>
                      ) : (
                        <pre className="padding-2 margin-bottom-2 overflow-x-auto bg-base-lightest">
                          <code className="font-body-sm font-mono">
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="padding-left-3 margin-left-0 border-left-4 border-primary-light">
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h1 className="margin-bottom-2 font-heading-3">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="margin-bottom-2 font-heading-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="margin-bottom-2 font-heading-5">
                        {children}
                      </h3>
                    ),
                    a: ({ href, children }) => (
                      <a
                        className="text-primary-dark text-underline"
                        href={href}
                      >
                        {children}
                      </a>
                    ),
                  }}
                  remarkPlugins={[remarkGfm]}
                >
                  {messageContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
