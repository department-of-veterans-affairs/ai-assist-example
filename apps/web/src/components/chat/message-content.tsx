import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

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
        p: ({ children }) => (
          <p className="margin-bottom-2 margin-top-0 font-body-md">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="margin-bottom-2 margin-top-0 margin-left-3">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="margin-bottom-2 margin-top-0 margin-left-3">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="margin-bottom-1">{children}</li>,
        code: ({ className, children }) => {
          const match = LANGUAGE_REGEX.exec(className || '');
          const isInline = !(match || className);

          if (isInline) {
            return (
              <code className="padding-x-1 radius-sm bg-base-lightest font-body-sm font-mono text-secondary-dark">
                {children}
              </code>
            );
          }

          return match ? (
            <SyntaxHighlighter
              className="margin-y-2 radius-md font-body-sm"
              language={match[1]}
              PreTag="div"
              showLineNumbers={false}
              style={oneDark}
            >
              {String(children).replace(TRAILING_NEWLINE_REGEX, '')}
            </SyntaxHighlighter>
          ) : (
            <pre className="padding-2 margin-y-2 radius-md overflow-x-auto bg-base-darkest">
              <code className="font-body-sm font-mono text-white">
                {children}
              </code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="padding-2 padding-left-3 margin-y-2 margin-left-0 radius-md border-left-05 border-primary-light bg-primary-lighter">
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
          <a
            className="text-primary text-underline"
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="margin-y-2 overflow-x-auto">
            <table className="width-full border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-base-lightest">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="padding-2 border-1px border-base-light text-left font-body-sm text-bold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="padding-2 border-1px border-base-light font-body-sm">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="margin-y-3 border-0 border-base-lighter border-top-1px" />
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
