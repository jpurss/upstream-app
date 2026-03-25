'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface MarkdownPreviewProps {
  value: string
  onChange: (val: string) => void
  name?: string
}

export function MarkdownPreview({ value, onChange, name }: MarkdownPreviewProps) {
  return (
    <Tabs defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="write">
        <Textarea
          name={name}
          className="font-mono text-[13px] min-h-[400px] resize-y"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your prompt in Markdown..."
        />
      </TabsContent>

      <TabsContent value="preview">
        <div className="min-h-[400px] p-4 border border-border rounded-lg overflow-auto">
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
                  return <code className="font-mono text-[13px]">{children}</code>
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
            }}
          >
            {value || '*Nothing to preview*'}
          </ReactMarkdown>
        </div>
      </TabsContent>
    </Tabs>
  )
}
