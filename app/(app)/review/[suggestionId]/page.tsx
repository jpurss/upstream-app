import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMergeSuggestionById } from '@/lib/data/merge-suggestions'
import { ReviewDetailClient } from '@/components/review/review-detail-client'

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ suggestionId: string }>
}) {
  // Admin gate (same as review/page.tsx)
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

  const { suggestionId } = await params
  const suggestion = await fetchMergeSuggestionById(suggestionId)
  if (!suggestion) notFound()

  return (
    <div className="p-6">
      <ReviewDetailClient suggestion={suggestion} />
    </div>
  )
}
