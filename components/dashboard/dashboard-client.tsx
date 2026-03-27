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

function getGreeting(name: string | null): string {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${timeGreeting}, ${name}` : timeGreeting
}

interface DashboardClientProps {
  displayName: string | null
  metrics: DashboardMetrics
  usageData: UsageDataPoint[]
  topPrompts: TopPrompt[]
  needsAttention: NeedsAttentionPrompt[]
  demandVsSupply: DemandDataPoint[]
}

export function DashboardClient({
  displayName,
  metrics,
  usageData,
  topPrompts,
  needsAttention,
  demandVsSupply,
}: DashboardClientProps) {
  return (
    <div className="p-8">
      <h1 className="text-sm text-muted-foreground uppercase tracking-wider mb-8 animate-fade-in-up stagger-1">
        {getGreeting(displayName)}
      </h1>

      {/* Zone 1: Metric Cards */}
      <div className="grid grid-cols-3 gap-6 animate-fade-in-up stagger-2">
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
          accentColor="#FFB852"
          subLines={[
            `${metrics.openMergeRequests} merge suggestions`,
            `${metrics.openPromptRequests} prompt requests`,
          ]}
        />
      </div>

      {/* Zone 2: Charts */}
      <div className="grid grid-cols-2 gap-6 mt-6 animate-fade-in-up stagger-3">
        <UsageLineChart data={usageData} />
        <DemandBarChart data={demandVsSupply} />
      </div>

      {/* Zone 3: Tables */}
      <div className="grid grid-cols-2 gap-6 mt-10 animate-fade-in-up stagger-4">
        <TopPromptsTable prompts={topPrompts} />
        <NeedsAttentionTable prompts={needsAttention} />
      </div>
    </div>
  )
}
