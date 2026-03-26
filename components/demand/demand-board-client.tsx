'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InboxIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { RequestCard } from '@/components/demand/request-card'
import { NewRequestDialog } from '@/components/demand/new-request-dialog'
import { ResolveRequestDialog } from '@/components/demand/resolve-request-dialog'
import type { PromptRequest } from '@/lib/types/prompt-request'

const STATUS_TABS = [
  { value: 'open', label: 'Open' },
  { value: 'planned', label: 'Planned' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'declined', label: 'Declined' },
  { value: 'all', label: 'All' },
]

const SORT_OPTIONS = [
  { value: 'upvotes', label: 'Most upvoted' },
  { value: 'newest', label: 'Newest first' },
  { value: 'urgent', label: 'Urgent first' },
]

interface ActivePrompt {
  id: string
  title: string
  category: string
}

interface DemandBoardClientProps {
  requests: PromptRequest[]
  currentStatus: string
  currentSort: string
  statusCounts: Record<string, number>
  isAdmin: boolean
  userId: string
  activePrompts?: ActivePrompt[]
}

export function DemandBoardClient({
  requests,
  currentStatus,
  currentSort,
  statusCounts,
  isAdmin,
  userId: _userId,
  activePrompts = [],
}: DemandBoardClientProps) {
  const router = useRouter()
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null)

  function handleTabChange(val: string) {
    router.push(`/demand?status=${val}&sort=${currentSort}`)
  }

  function handleSortChange(val: string) {
    router.push(`/demand?status=${currentStatus}&sort=${val}`)
  }

  function getTabLabel(value: string, baseLabel: string): string {
    if (value === 'all') return baseLabel
    const count = statusCounts[value] ?? 0
    return count > 0 ? `${baseLabel} (${count})` : baseLabel
  }

  const isEmpty = requests.length === 0

  return (
    <div className="p-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold">Demand Board</h1>
        <Button
          className="bg-[#4287FF] hover:bg-[#4287FF]/90 text-white"
          onClick={() => setNewRequestOpen(true)}
        >
          New Request
        </Button>
      </div>

      {/* Filter tabs row + sort control */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Tabs value={currentStatus} onValueChange={handleTabChange}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {getTabLabel(tab.value, tab.label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Sort control */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] text-muted-foreground">Sort:</span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] h-8 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Request list or empty state */}
      <div className="mt-4">
        {isEmpty ? (
          <EmptyState status={currentStatus} onNewRequest={() => setNewRequestOpen(true)} />
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                isAdmin={isAdmin}
                onResolveClick={(id) => setResolvingRequestId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Request Dialog */}
      <NewRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} />

      {/* Resolve Request Dialog */}
      {resolvingRequestId && (
        <ResolveRequestDialog
          open={true}
          onOpenChange={(open) => { if (!open) setResolvingRequestId(null) }}
          requestId={resolvingRequestId}
          prompts={activePrompts}
        />
      )}
    </div>
  )
}

function EmptyState({
  status,
  onNewRequest,
}: {
  status: string
  onNewRequest: () => void
}) {
  if (status === 'open') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <InboxIcon className="size-8 text-muted-foreground mb-4" />
        <h2 className="text-[20px] font-semibold">No open requests</h2>
        <p className="text-[15px] text-muted-foreground mt-2 max-w-[400px]">
          Consultants can submit prompt gaps here. Open requests are sorted by upvotes.
        </p>
        <Button
          className="mt-4 bg-[#4287FF] hover:bg-[#4287FF]/90 text-white"
          onClick={onNewRequest}
        >
          New Request
        </Button>
      </div>
    )
  }

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <InboxIcon className="size-8 text-muted-foreground mb-4" />
      <h2 className="text-[20px] font-semibold">No {status} requests</h2>
      <p className="text-[15px] text-muted-foreground mt-2 max-w-[400px]">
        {statusLabel} requests will appear here.
      </p>
    </div>
  )
}

/**
 * Loading skeleton for demand board — 5 cards at ~96px height.
 * Used by a loading.tsx or Suspense wrapper if needed.
 */
export function DemandBoardSkeleton() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
