import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchEngagementById } from '@/lib/data/engagements'
import { fetchForksByEngagement } from '@/lib/data/forks'
import { fetchAllActivePrompts } from '@/lib/data/prompts'
import { WorkspaceClient } from '@/components/engagements/workspace-client'

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

  // Fetch forks and prompts in parallel for the picker modal
  const [forks, prompts] = await Promise.all([
    fetchForksByEngagement(id),
    fetchAllActivePrompts(),
  ])

  // Compute stats
  const forkCount = forks.length
  const ratedForks = forks.filter((f) => f.effectiveness_rating !== null)
  const avgEffectiveness =
    ratedForks.length > 0
      ? ratedForks.reduce((sum, f) => sum + (f.effectiveness_rating ?? 0), 0) /
        ratedForks.length
      : null

  // IDs of prompts already forked into this engagement — prevents duplicates in picker
  const forkedPromptIds = forks.map((f) => f.source_prompt_id)

  return (
    <div className="p-8">
      <WorkspaceClient
        engagement={engagement}
        forkCount={forkCount}
        avgEffectiveness={avgEffectiveness}
        prompts={prompts}
        forkedPromptIds={forkedPromptIds}
        forks={forks}
      />
    </div>
  )
}
