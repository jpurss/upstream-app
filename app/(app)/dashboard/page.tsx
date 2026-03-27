import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  fetchDashboardMetrics,
  fetchUsageOverTime,
  fetchTopPrompts,
  fetchNeedsAttention,
  fetchDemandVsSupply,
} from '@/lib/data/dashboard'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  if (effectiveRole !== 'admin') redirect('/library')

  // Derive display name (same pattern as layout)
  let displayName: string | null = null
  if (user.user_metadata?.display_name) {
    displayName = user.user_metadata.display_name as string
  } else if (!isAnonymous) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    displayName = profile?.name ?? null
  }

  const [metrics, usage, topPrompts, needsAttention, demandVsSupply] = await Promise.all([
    fetchDashboardMetrics(),
    fetchUsageOverTime(),
    fetchTopPrompts(),
    fetchNeedsAttention(),
    fetchDemandVsSupply(),
  ])

  return (
    <DashboardClient
      displayName={displayName}
      metrics={metrics}
      usageData={usage}
      topPrompts={topPrompts}
      needsAttention={needsAttention}
      demandVsSupply={demandVsSupply}
    />
  )
}
