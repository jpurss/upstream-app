import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchUserEngagements } from '@/lib/data/engagements'
import { fetchAllActivePrompts } from '@/lib/data/prompts'
import { EngagementGrid } from '@/components/engagements/engagement-grid'
import { NewEngagementDialog } from '@/components/engagements/new-engagement-dialog'
import { EngagementsGreeting } from '@/components/engagements/engagements-greeting'

export default async function EngagementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Derive display name
  const isAnonymous = user.is_anonymous ?? false
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

  const [engagements, prompts] = await Promise.all([
    fetchUserEngagements(user.id),
    fetchAllActivePrompts(),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up stagger-1">
        <EngagementsGreeting displayName={displayName} />
        <NewEngagementDialog prompts={prompts} />
      </div>
      <div className="animate-fade-in-up stagger-2">
        <EngagementGrid
          engagements={engagements}
          userId={user.id}
        />
      </div>
    </div>
  )
}
