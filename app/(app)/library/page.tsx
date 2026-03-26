import Link from 'next/link'
import { Plus } from 'lucide-react'
import { fetchAllActivePrompts } from '@/lib/data/prompts'
import { createClient } from '@/lib/supabase/server'
import { LibraryGrid } from '@/components/library/library-grid'
import { Button } from '@/components/ui/button'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Reading searchParams tells Next.js this page depends on URL params,
  // so it re-renders on back-navigation instead of serving stale cache.
  await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role as string | null
  const isAnonymous = user?.is_anonymous ?? false
  const demoRole = isAnonymous ? ((user?.user_metadata?.demo_role as string) ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)
  const isAdmin = effectiveRole === 'admin'

  const prompts = await fetchAllActivePrompts()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Prompt Library</h1>
        {isAdmin && (
          <Button render={<Link href="/library/new" />} nativeButton={false}>
            <Plus data-icon="inline-start" />
            New Prompt
          </Button>
        )}
      </div>
      <LibraryGrid
        initialPrompts={prompts}
        isAdmin={isAdmin}
        totalCount={prompts.length}
      />
    </div>
  )
}
