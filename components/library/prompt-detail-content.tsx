'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PromptDetailContentProps {
  content: string
}

export function PromptDetailContent({ content }: PromptDetailContentProps) {
  return (
    <div className="flex-1 min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="font-mono text-[13px] text-foreground leading-relaxed mb-4">
              {children}
            </p>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code className="font-mono text-[13px]">{children}</code>
              )
            }
            return (
              <code className="font-mono text-[13px] bg-muted px-1 py-0.5 rounded">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="font-mono text-[13px] bg-muted p-4 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-semibold mb-3 mt-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 mt-5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-2 mt-4">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="font-mono text-[13px] list-disc pl-6 mb-4 flex flex-col gap-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="font-mono text-[13px] list-decimal pl-6 mb-4 flex flex-col gap-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <table className="font-mono text-[13px] w-full border-collapse mb-4">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-2 font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-foreground">{children}</td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
