import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

describe('DemoBanner', () => {
  it('Test 4: renders "Demo mode" text when isAnonymous is true', async () => {
    const { DemoBanner } = await import('@/components/demo-banner')
    const { container } = render(
      <DemoBanner isAnonymous={true} demoRole="consultant" />
    )
    expect(container.textContent).toContain('Demo mode')
  })

  it('Test 5: renders nothing when isAnonymous is false', async () => {
    const { DemoBanner } = await import('@/components/demo-banner')
    const { container } = render(
      <DemoBanner isAnonymous={false} demoRole={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('Test 6: shows "Consultant" role label when demoRole is consultant', async () => {
    const { DemoBanner } = await import('@/components/demo-banner')
    render(<DemoBanner isAnonymous={true} demoRole="consultant" />)
    expect(screen.getByText(/Consultant/)).toBeInTheDocument()
  })

  it('Test 6b: shows "Admin" role label when demoRole is admin', async () => {
    const { DemoBanner } = await import('@/components/demo-banner')
    render(<DemoBanner isAnonymous={true} demoRole="admin" />)
    expect(screen.getByText(/Admin/)).toBeInTheDocument()
  })
})
