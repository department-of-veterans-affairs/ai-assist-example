import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
  if (isUser) {
    return <p className="margin-0">{content}</p>;
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="margin-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="margin-bottom-2 margin-left-3">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="margin-bottom-2 margin-left-3">{children}</ol>
        ),
        li: ({ children }) => <li className="margin-bottom-1">{children}</li>,
        code: ({ className, children }) => {
          const isInline = !className;
          return isInline ? (
            <code className="padding-x-1 bg-base-lightest font-mono">
              {children}
            </code>
          ) : (
            <pre className="padding-2 margin-bottom-2 overflow-x-auto bg-base-lightest">
              <code className="font-body-sm font-mono">{children}</code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="padding-left-3 margin-left-0 border-left-4 border-primary-light">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => (
          <h1 className="margin-bottom-2 font-heading-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="margin-bottom-2 font-heading-4">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="margin-bottom-2 font-heading-5">{children}</h3>
        ),
        a: ({ href, children }) => (
          <a className="text-primary-dark text-underline" href={href}>
            {children}
          </a>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
