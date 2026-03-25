'use client'

import Link from 'next/link'
import {
  Library,
  Briefcase,
  MessageSquarePlus,
  GitPullRequestArrow,
  BarChart3,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/lib/auth-utils'

interface NavItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  enabled: boolean
  adminOnly: boolean
  phase: number
}

const navItems: NavItem[] = [
  { title: 'Library', icon: Library, href: '/library', enabled: true, adminOnly: false, phase: 2 },
  { title: 'Engagements', icon: Briefcase, href: '/engagements', enabled: false, adminOnly: false, phase: 3 },
  { title: 'Demand Board', icon: MessageSquarePlus, href: '/demand', enabled: false, adminOnly: false, phase: 5 },
  { title: 'Review Queue', icon: GitPullRequestArrow, href: '/review', enabled: false, adminOnly: true, phase: 4 },
  { title: 'Dashboard', icon: BarChart3, href: '/dashboard', enabled: false, adminOnly: true, phase: 5 },
]

interface AppSidebarProps {
  userRole: 'consultant' | 'admin' | 'anon' | null
  userName: string | null
  isAnonymous: boolean
}

export function AppSidebar({ userRole, userName, isAnonymous }: AppSidebarProps) {
  // Filter admin-only items for non-admins
  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && userRole !== 'admin') return false
    return true
  })

  // Derive display name and initials
  const displayName = userName ?? (isAnonymous
    ? (userRole === 'admin' ? 'Demo Admin' : 'Demo Consultant')
    : 'User')
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = userRole === 'admin' ? 'Admin' : 'Consultant'

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-[16px] font-semibold text-white group-data-[collapsible=icon]:hidden">
            Upstream
          </span>
          <span className="text-[16px] font-semibold text-white hidden group-data-[collapsible=icon]:block">
            U
          </span>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {visibleItems.map((item) => {
              const Icon = item.icon
              if (item.enabled) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                    isActive={true}
                    render={<Link href={item.href} />}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    aria-disabled="true"
                    tabIndex={-1}
                    className="text-zinc-600 cursor-not-allowed hover:bg-transparent hover:text-zinc-600"
                    title={`Coming in Phase ${item.phase}`}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:flex-col">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-[14px] text-white truncate">{displayName}</span>
            <Badge variant="secondary" className="text-[11px] w-fit mt-0.5">
              {roleLabel}
            </Badge>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-2 py-1 text-[14px] text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors group-data-[collapsible=icon]:justify-center"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Log out</span>
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
