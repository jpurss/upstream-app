import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchUserEngagements } from '@/lib/data/engagements'
import { fetchAllActivePrompts } from '@/lib/data/prompts'
import { EngagementGrid } from '@/components/engagements/engagement-grid'
import { NewEngagementDialog } from '@/components/engagements/new-engagement-dialog'

export default async function EngagementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [engagements, prompts] = await Promise.all([
    fetchUserEngagements(user.id),
    fetchAllActivePrompts(),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Engagements</h1>
        {engagements.length > 0 && (
          <NewEngagementDialog prompts={prompts} />
        )}
      </div>
      <EngagementGrid
        engagements={engagements}
        userId={user.id}
        prompts={prompts}
      />
    </div>
  )
}
