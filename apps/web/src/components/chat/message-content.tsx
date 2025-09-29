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
    return <p className="m-0 text-base text-white">{content}</p>;
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mt-0 mb-4 text-base text-base-darker">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-0 mb-4 ml-6 list-disc space-y-2 text-base text-base-darker">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-0 mb-4 ml-6 list-decimal space-y-2 text-base text-base-darker">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="mb-2">{children}</li>,
        code: ({ className, children }) => {
          const match = LANGUAGE_REGEX.exec(className || '');
          const isInline = !(match || className);

          if (isInline) {
            return (
              <code className="rounded-sm bg-base-lightest px-2 py-0.5 font-mono text-base-dark text-sm">
                {children}
              </code>
            );
          }

          return match ? (
            <SyntaxHighlighter
              className="my-4 rounded-md text-sm"
              language={match[1]}
              PreTag="div"
              showLineNumbers={false}
              style={oneDark}
            >
              {String(children).replace(TRAILING_NEWLINE_REGEX, '')}
            </SyntaxHighlighter>
          ) : (
            <pre className="my-4 overflow-x-auto rounded-md bg-base-darkest p-4">
              <code className="font-mono text-sm text-white">{children}</code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="my-4 rounded-md border-primary-light border-l-[4px] bg-primary-lighter px-4 py-3">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => (
          <h1 className="mb-4 font-semibold text-2xl text-base-darker">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 font-semibold text-base-darker text-xl">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 font-semibold text-base-darker text-lg">
            {children}
          </h3>
        ),
        a: ({ href, children }) => (
          <a
            className="text-primary underline"
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-base-darker text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-base-lightest text-base-darker">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border border-base-light px-4 py-2 font-semibold text-sm">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-base-light px-4 py-2 text-sm">
            {children}
          </td>
        ),
        hr: () => <hr className="my-6 border-base-lighter border-t" />,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
