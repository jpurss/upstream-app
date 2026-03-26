'use client'

import { MetricCard } from '@/components/dashboard/metric-card'
import { UsageLineChart } from '@/components/dashboard/usage-line-chart'
import { DemandBarChart } from '@/components/dashboard/demand-bar-chart'
import { TopPromptsTable } from '@/components/dashboard/top-prompts-table'
import { NeedsAttentionTable } from '@/components/dashboard/needs-attention-table'
import { BookOpen, GitFork, Inbox } from 'lucide-react'
import type {
  DashboardMetrics,
  UsageDataPoint,
  TopPrompt,
  NeedsAttentionPrompt,
  DemandDataPoint,
} from '@/lib/data/dashboard'

interface DashboardClientProps {
  metrics: DashboardMetrics
  usageData: UsageDataPoint[]
  topPrompts: TopPrompt[]
  needsAttention: NeedsAttentionPrompt[]
  demandVsSupply: DemandDataPoint[]
}

export function DashboardClient({
  metrics,
  usageData,
  topPrompts,
  needsAttention,
  demandVsSupply,
}: DashboardClientProps) {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-[20px] font-semibold text-foreground">"Dashboard"</h1>

      {/* Zone 1: Metric Cards */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard
          icon={BookOpen}
          value={metrics.activePrompts}
          label="Active Prompts"
        />
        <MetricCard
          icon={GitFork}
          value={metrics.totalCheckouts}
          label="Total Checkouts"
        />
        <MetricCard
          icon={Inbox}
          value={metrics.openMergeRequests + metrics.openPromptRequests}
          label="Open Items"
          subLines={[
            `${metrics.openMergeRequests} merge suggestions`,
            `${metrics.openPromptRequests} prompt requests`,
          ]}
        />
      </div>

      {/* Zone 2: Charts */}
      <div className="space-y-6">
        <UsageLineChart data={usageData} />
        <DemandBarChart data={demandVsSupply} />
      </div>

      {/* Zone 3: Tables */}
      <div className="grid grid-cols-2 gap-6">
        <TopPromptsTable prompts={topPrompts} />
        <NeedsAttentionTable prompts={needsAttention} />
      </div>
    </div>
  )
}
