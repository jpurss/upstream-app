'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DiffViewer } from '@/components/engagements/diff-viewer'
import { updateForkContent } from '@/app/(app)/engagements/[id]/forks/[forkId]/actions'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

interface ForkEditorProps {
  fork: ForkedPromptWithTitle
  onSaveStateChange: (state: 'idle' | 'saving' | 'saved') => void
}

export function ForkEditor({ fork, onSaveStateChange }: ForkEditorProps) {
  const [content, setContent] = useState(fork.adapted_content ?? '')
  const [, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (value: string) => {
      onSaveStateChange('saving')
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        startTransition(async () => {
          const result = await updateForkContent(fork.id, value)
          if (result.error) {
            toast.error("Couldn't save changes. Retrying...", {
              duration: 5000,
            })
          } else {
            onSaveStateChange('saved')
            setTimeout(() => onSaveStateChange('idle'), 2000)
          }
        })
      }, 1500)
    },
    [fork.id, onSaveStateChange]
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setContent(value)
    scheduleSave(value)
  }

  return (
    <Tabs defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="diff">Diff</TabsTrigger>
      </TabsList>

      <TabsContent value="write">
        <Textarea
          className="font-mono text-[13px] min-h-[400px] resize-none mt-2"
          value={content}
          onChange={handleChange}
          placeholder="Write your adapted prompt in Markdown..."
        />
      </TabsContent>

      <TabsContent value="preview">
        <div className="min-h-[400px] p-4 border border-border rounded-lg overflow-auto mt-2">
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
                <h1 className="text-base font-semibold mb-3 mt-6 border-b border-border pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-[14px] font-semibold mb-2 mt-5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-[13px] font-semibold mb-2 mt-4">{children}</h3>
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
            {content || '*Nothing to preview*'}
          </ReactMarkdown>
        </div>
      </TabsContent>

      <TabsContent value="diff">
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <DiffViewer original={fork.original_content} adapted={content} showDiffOnly={false} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
