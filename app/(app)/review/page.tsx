import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMergeSuggestions } from '@/lib/data/merge-suggestions'
import { ReviewQueueClient } from './review-queue-client'

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  if (effectiveRole !== 'admin') redirect('/engagements')

  const { status = 'pending' } = await searchParams
  const validStatuses = ['pending', 'approved', 'declined', 'all']
  const currentStatus = validStatuses.includes(status) ? status : 'pending'

  const suggestions = await fetchMergeSuggestions(currentStatus as 'pending' | 'approved' | 'declined' | 'all')

  return <ReviewQueueClient suggestions={suggestions} currentStatus={currentStatus} />
}
