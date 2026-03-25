import { notFound } from 'next/navigation'
import { fetchForkById } from '@/lib/data/forks'
import { fetchEngagementById } from '@/lib/data/engagements'
import { ForkDetailClient } from '@/components/engagements/fork-detail-client'

export default async function ForkDetailPage({
  params,
}: {
  params: Promise<{ id: string; forkId: string }>
}) {
  const { id, forkId } = await params
  const fork = await fetchForkById(forkId)
  const engagement = await fetchEngagementById(id)
  if (!fork || !engagement) notFound()

  return (
    <div className="p-8">
      <ForkDetailClient fork={fork} engagement={engagement} />
    </div>
  )
}
