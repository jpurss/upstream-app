import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { DiffViewer } from '../components/engagements/diff-viewer'

// Mock react-diff-viewer-continued to avoid heavy rendering in unit tests
vi.mock('react-diff-viewer-continued', () => ({
  default: vi.fn(({ leftTitle, rightTitle, oldValue, newValue }) => (
    <div data-testid="mock-diff-viewer">
      <span data-testid="left-title">{leftTitle ?? 'Original'}</span>
      <span data-testid="right-title">{rightTitle ?? 'Adapted'}</span>
      <span data-testid="old-value">{oldValue}</span>
      <span data-testid="new-value">{newValue}</span>
    </div>
  )),
}))

describe('DiffViewer — Custom Title Props', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default titles Original and Adapted when no props given', () => {
    render(<DiffViewer original="old content" adapted="new content" />)
    expect(screen.getByTestId('left-title')).toHaveTextContent('Original')
    expect(screen.getByTestId('right-title')).toHaveTextContent('Adapted')
  })

  it('renders with custom leftTitle and rightTitle when provided', () => {
    render(
      <DiffViewer
        original="old content"
        adapted="new content"
        leftTitle="Library (current)"
        rightTitle="Fork (adapted)"
      />
    )
    expect(screen.getByTestId('left-title')).toHaveTextContent('Library (current)')
    expect(screen.getByTestId('right-title')).toHaveTextContent('Fork (adapted)')
  })

  it('shows No differences found when original equals adapted', () => {
    render(<DiffViewer original="same content" adapted="same content" />)
    expect(screen.getByText('No differences found.')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-diff-viewer')).not.toBeInTheDocument()
  })
})
