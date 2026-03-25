import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchEngagementById } from '@/lib/data/engagements'
import { fetchForksByEngagement } from '@/lib/data/forks'
import { WorkspaceHeader } from '@/components/engagements/workspace-header'
import { ForkGrid } from '@/components/engagements/fork-grid'

export default async function EngagementWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Verify authenticated session (RLS handles scoping)
  const supabase = await createClient()
  await supabase.auth.getUser()

  const engagement = await fetchEngagementById(id)
  if (!engagement) {
    notFound()
  }

  const forks = await fetchForksByEngagement(id)

  // Compute stats
  const forkCount = forks.length
  const ratedForks = forks.filter((f) => f.effectiveness_rating !== null)
  const avgEffectiveness =
    ratedForks.length > 0
      ? ratedForks.reduce((sum, f) => sum + (f.effectiveness_rating ?? 0), 0) /
        ratedForks.length
      : null

  return (
    <div className="p-8">
      <WorkspaceHeader
        engagement={engagement}
        forkCount={forkCount}
        avgEffectiveness={avgEffectiveness}
      />
      <ForkGrid forks={forks} engagementId={id} />
    </div>
  )
}
