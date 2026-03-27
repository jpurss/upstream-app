import { createAdminClient } from '@/lib/supabase/admin'

export interface DashboardMetrics {
  activePrompts: number
  totalCheckouts: number
  openMergeRequests: number
  openPromptRequests: number
}

export interface UsageDataPoint {
  week: string    // e.g. "Mar 3" (week start formatted)
  count: number   // checkouts in that week
}

export interface TopPrompt {
  id: string
  title: string
  total_checkouts: number
}

export interface NeedsAttentionPrompt {
  id: string
  title: string
  avg_effectiveness: number
  total_checkouts: number
  type: 'lowest_rated' | 'underutilized'
}

export interface DemandDataPoint {
  month: string    // e.g. "Jan", "Feb"
  opened: number
  resolved: number
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createAdminClient()

  // Active prompts count
  const { count: activePrompts } = await supabase
    .from('prompts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total checkouts (all forks ever created)
  const { count: totalCheckouts } = await supabase
    .from('forked_prompts')
    .select('id', { count: 'exact', head: true })

  // Open merge requests (pending)
  const { count: openMergeRequests } = await supabase
    .from('forked_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('merge_status', 'pending')

  // Open prompt requests
  const { count: openPromptRequests } = await supabase
    .from('prompt_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')

  return {
    activePrompts: activePrompts ?? 0,
    totalCheckouts: totalCheckouts ?? 0,
    openMergeRequests: openMergeRequests ?? 0,
    openPromptRequests: openPromptRequests ?? 0,
  }
}

export async function fetchUsageOverTime(): Promise<UsageDataPoint[]> {
  const supabase = createAdminClient()
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84) // 12 * 7

  const { data } = await supabase
    .from('forked_prompts')
    .select('forked_at')
    .gte('forked_at', twelveWeeksAgo.toISOString())
    .order('forked_at')

  // Use UTC throughout to avoid local-timezone key mismatches
  function sundayKeyUTC(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return d.toISOString().split('T')[0]
  }

  function labelFromKey(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }

  // Group by week
  const weekMap = new Map<string, number>()
  for (const row of data ?? []) {
    const key = sundayKeyUTC(new Date(row.forked_at))
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
  }

  // Fill in missing weeks with 0
  const result: UsageDataPoint[] = []
  const current = new Date(Date.UTC(
    twelveWeeksAgo.getUTCFullYear(), twelveWeeksAgo.getUTCMonth(), twelveWeeksAgo.getUTCDate()
  ))
  current.setUTCDate(current.getUTCDate() - current.getUTCDay())
  const now = new Date()
  while (current <= now) {
    const key = current.toISOString().split('T')[0]
    result.push({ week: labelFromKey(key), count: weekMap.get(key) ?? 0 })
    current.setUTCDate(current.getUTCDate() + 7)
  }

  return result
}

export async function fetchTopPrompts(): Promise<TopPrompt[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('prompts')
    .select('id, title, total_checkouts')
    .eq('status', 'active')
    .order('total_checkouts', { ascending: false })
    .limit(10)
  return (data ?? []) as TopPrompt[]
}

export async function fetchNeedsAttention(): Promise<NeedsAttentionPrompt[]> {
  const supabase = createAdminClient()

  // Lowest rated (bottom 5 by avg_effectiveness, only those with ratings > 0)
  const { data: lowestRated } = await supabase
    .from('prompts')
    .select('id, title, avg_effectiveness, total_checkouts')
    .eq('status', 'active')
    .gt('total_ratings', 0)
    .order('avg_effectiveness', { ascending: true })
    .limit(5)

  // Underutilized (0 checkouts)
  const { data: underutilized } = await supabase
    .from('prompts')
    .select('id, title, avg_effectiveness, total_checkouts')
    .eq('status', 'active')
    .eq('total_checkouts', 0)

  return [
    ...(lowestRated ?? []).map((p: any) => ({ ...p, type: 'lowest_rated' as const })),
    ...(underutilized ?? []).map((p: any) => ({ ...p, type: 'underutilized' as const })),
  ]
}

export async function fetchDemandVsSupply(): Promise<DemandDataPoint[]> {
  const supabase = createAdminClient()
  // Fetch all prompt_requests, group by month in JS (same approach as usage over time)
  const { data: allRequests } = await supabase
    .from('prompt_requests')
    .select('status, created_at, resolved_at')

  const monthMap = new Map<string, { opened: number; resolved: number }>()

  for (const r of allRequests ?? []) {
    // Opened month
    const createdMonth = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short' })
    const entry = monthMap.get(createdMonth) ?? { opened: 0, resolved: 0 }
    entry.opened++
    monthMap.set(createdMonth, entry)

    // Resolved month (if applicable)
    if (r.resolved_at) {
      const resolvedMonth = new Date(r.resolved_at).toLocaleDateString('en-US', { month: 'short' })
      const rEntry = monthMap.get(resolvedMonth) ?? { opened: 0, resolved: 0 }
      rEntry.resolved++
      monthMap.set(resolvedMonth, rEntry)
    }
  }

  return Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    opened: data.opened,
    resolved: data.resolved,
  }))
}
