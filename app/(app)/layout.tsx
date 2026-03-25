import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DemoBanner } from '@/components/demo-banner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = (user.app_metadata?.role as 'consultant' | 'admin' | null) ?? null
  const isAnonymous = user.is_anonymous ?? false

  // Derive display name
  let displayName: string | null = null
  if (user.user_metadata?.display_name) {
    displayName = user.user_metadata.display_name as string
  } else if (!isAnonymous) {
    // Try to get name from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    displayName = profile?.name ?? null
  }

  // For demo users, determine demo role from metadata
  const demoRole = isAnonymous
    ? ((user.user_metadata?.demo_role as 'consultant' | 'admin' | null) ?? 'consultant')
    : null

  // Use demoRole as fallback for anonymous users (Auth Hook only writes from profiles table)
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner isAnonymous={isAnonymous} demoRole={demoRole} />
      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar userRole={effectiveRole} userName={displayName} isAnonymous={isAnonymous} />
          <main className="flex-1 overflow-auto">
            <SidebarTrigger />
            <NuqsAdapter>{children}</NuqsAdapter>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
