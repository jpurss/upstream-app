import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/library'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock the auth-utils signOut
vi.mock('@/lib/auth-utils', () => ({
  signOut: vi.fn(),
}))

// Mock shadcn sidebar internals (it uses cookies, etc.)
vi.mock('@/components/ui/sidebar', () => {
  const SidebarProvider = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  )
  const Sidebar = ({ children }: { children: React.ReactNode }) => (
    <nav data-testid="sidebar">{children}</nav>
  )
  const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-header">{children}</div>
  )
  const SidebarContent = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  )
  const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-footer">{children}</div>
  )
  const SidebarMenu = ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  )
  const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  )
  const SidebarMenuButton = ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode
    asChild?: boolean
    [key: string]: unknown
  }) => <button {...props}>{children}</button>
  const SidebarGroup = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
  const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  )
  const SidebarTrigger = () => <button data-testid="sidebar-trigger">Toggle</button>
  const SidebarSeparator = () => <hr />
  return {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarTrigger,
    SidebarSeparator,
  }
})

// Mock shadcn badge
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}))

// Mock shadcn avatar
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('AppSidebar', () => {
  it('Test 1: renders all 5 nav items when userRole is admin', async () => {
    const { AppSidebar } = await import('@/components/app-sidebar')
    render(
      <AppSidebar userRole="admin" userName="Admin User" isAnonymous={false} />
    )

    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Engagements')).toBeInTheDocument()
    expect(screen.getByText('Demand Board')).toBeInTheDocument()
    expect(screen.getByText('Review Queue')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('Test 2: renders only 3 nav items when userRole is consultant (no Review Queue, no Dashboard)', async () => {
    const { AppSidebar } = await import('@/components/app-sidebar')
    render(
      <AppSidebar userRole="consultant" userName="Consultant User" isAnonymous={false} />
    )

    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Engagements')).toBeInTheDocument()
    expect(screen.getByText('Demand Board')).toBeInTheDocument()
    expect(screen.queryByText('Review Queue')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('Test 3: All nav items are enabled in Phase 5 — no aria-disabled items', async () => {
    const { AppSidebar } = await import('@/components/app-sidebar')
    render(
      <AppSidebar userRole="admin" userName="Admin User" isAnonymous={false} />
    )

    // Phase 5: Demand Board and Dashboard are now enabled — no disabled nav items remain
    const disabledItems = document.querySelectorAll('[aria-disabled="true"]')
    expect(disabledItems.length).toBe(0)
  })
})
