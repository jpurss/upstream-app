import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

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

  it.todo('renders with default titles Original and Adapted when no props given')
  it.todo('renders with custom leftTitle and rightTitle when provided')
  it.todo('shows No differences found when original equals adapted')
})
