import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { DiffViewer } from '../components/engagements/diff-viewer'
import { ReviewContextBar } from '../components/review/review-context-bar'
import { ReviewContentEditor } from '../components/review/review-content-editor'
import { ApproveConfirmDialog } from '../components/review/approve-confirm-dialog'
import { ReviewDetailClient } from '../components/review/review-detail-client'
import { ReviewActionBar } from '../components/review/review-action-bar'
import type { MergeSuggestion } from '../lib/types/merge'

// Mock react-diff-viewer-continued to avoid heavy rendering in unit tests
vi.mock('react-diff-viewer-continued', () => ({
  default: vi.fn(({ leftTitle, rightTitle, oldValue, newValue, showDiffOnly, extraLinesSurroundingDiff }) => (
    <div data-testid="mock-diff-viewer">
      <span data-testid="left-title">{leftTitle ?? 'Original'}</span>
      <span data-testid="right-title">{rightTitle ?? 'Adapted'}</span>
      <span data-testid="old-value">{oldValue}</span>
      <span data-testid="new-value">{newValue}</span>
      <span data-testid="show-diff-only">{String(showDiffOnly)}</span>
      <span data-testid="extra-lines">{String(extraLinesSurroundingDiff)}</span>
    </div>
  )),
}))

// Mock approveMerge server action
vi.mock('../app/(app)/review/actions', () => ({
  approveMerge: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock @base-ui/react/tooltip
vi.mock('@base-ui/react/tooltip', () => {
  const Provider = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Root = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Trigger = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <span {...props}>{children}</span>
  const Portal = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Positioner = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  const Popup = ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>
  const Arrow = () => null
  return { Tooltip: { Provider, Root, Trigger, Portal, Positioner, Popup, Arrow } }
})

// Mock @base-ui/react/alert-dialog
vi.mock('@base-ui/react/alert-dialog', () => {
  const Root = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Trigger = ({ children, render: renderProp }: { children?: React.ReactNode; render?: React.ReactNode }) => {
    if (renderProp && React.isValidElement(renderProp)) {
      return React.cloneElement(renderProp, {}, children)
    }
    return <button>{children}</button>
  }
  const Portal = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Backdrop = () => null
  const Popup = ({ children }: { children: React.ReactNode }) => <div role="alertdialog">{children}</div>
  const Title = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>
  const Description = ({ children }: { children: React.ReactNode }) => <p>{children}</p>
  const Close = ({ children, render: renderProp }: { children?: React.ReactNode; render?: React.ReactNode }) => {
    if (renderProp && React.isValidElement(renderProp)) {
      return React.cloneElement(renderProp, {}, children)
    }
    return <button>{children}</button>
  }
  return { AlertDialog: { Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close } }
})

const mockSuggestion: MergeSuggestion = {
  id: 'fork-1',
  merge_status: 'pending',
  merge_suggestion: 'This is a merge note explaining the changes made.',
  merge_decline_reason: null,
  adapted_content: 'Adapted content here',
  original_content: 'Original content here',
  effectiveness_rating: 4,
  issues: [],
  feedback_notes: null,
  adaptation_notes: null,
  contains_client_context: false,
  forked_at: '2026-03-01T00:00:00Z',
  forked_by: 'user-1',
  source_prompt_id: 'prompt-1',
  engagement_id: 'eng-1',
  source_prompt_title: 'Discovery Interview',
  source_prompt_content: 'Source content',
  source_prompt_version: 2,
  submitter_name: 'Jane Smith',
  engagement_name: 'Acme Corp',
}

// ─── DiffViewer ───────────────────────────────────────────────────────────────

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

  it('passes showDiffOnly prop to ReactDiffViewer (defaults to true)', () => {
    render(<DiffViewer original="old content" adapted="new content" />)
    expect(screen.getByTestId('show-diff-only')).toHaveTextContent('true')
  })

  it('passes showDiffOnly={false} when explicitly set', () => {
    render(<DiffViewer original="old content" adapted="new content" showDiffOnly={false} />)
    expect(screen.getByTestId('show-diff-only')).toHaveTextContent('false')
  })

  it('passes extraLinesSurroundingDiff prop to ReactDiffViewer (defaults to 3)', () => {
    render(<DiffViewer original="old content" adapted="new content" />)
    expect(screen.getByTestId('extra-lines')).toHaveTextContent('3')
  })

  it('passes custom extraLinesSurroundingDiff value', () => {
    render(<DiffViewer original="old content" adapted="new content" extraLinesSurroundingDiff={5} />)
    expect(screen.getByTestId('extra-lines')).toHaveTextContent('5')
  })
})

// ─── ReviewContextBar ─────────────────────────────────────────────────────────

describe('ReviewContextBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders submitter name', () => {
    render(<ReviewContextBar suggestion={mockSuggestion} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders engagement name as a link', () => {
    render(<ReviewContextBar suggestion={mockSuggestion} />)
    const link = screen.getByRole('link', { name: /acme corp/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/engagements/eng-1')
  })

  it('renders star rating when effectiveness_rating is present', () => {
    render(<ReviewContextBar suggestion={mockSuggestion} />)
    // StarRating renders stars — check the component is present by looking for buttons
    const stars = screen.getAllByRole('button', { name: /rate effectiveness/i })
    expect(stars.length).toBeGreaterThan(0)
  })

  it('shows "No rating" when effectiveness_rating is null', () => {
    render(<ReviewContextBar suggestion={{ ...mockSuggestion, effectiveness_rating: null }} />)
    expect(screen.getByText('No rating')).toBeInTheDocument()
  })

  it('renders merge note when present', () => {
    render(<ReviewContextBar suggestion={mockSuggestion} />)
    // Text may appear twice due to tooltip (trigger + content) — use getAllByText
    const mergeNoteElements = screen.getAllByText('This is a merge note explaining the changes made.')
    expect(mergeNoteElements.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render merge note row when merge_suggestion is null', () => {
    render(<ReviewContextBar suggestion={{ ...mockSuggestion, merge_suggestion: null }} />)
    expect(screen.queryByText(/merge note/i)).not.toBeInTheDocument()
  })

  it('does not show "More context" toggle when feedback_notes and adaptation_notes are both null', () => {
    render(<ReviewContextBar suggestion={mockSuggestion} />)
    expect(screen.queryByText('More context')).not.toBeInTheDocument()
  })

  it('shows "More context" toggle when feedback_notes exist', () => {
    render(<ReviewContextBar suggestion={{ ...mockSuggestion, feedback_notes: 'Consultant found this effective.' }} />)
    expect(screen.getByText('More context')).toBeInTheDocument()
  })

  it('reveals feedback_notes on "More context" toggle click', () => {
    render(
      <ReviewContextBar
        suggestion={{ ...mockSuggestion, feedback_notes: 'Great feedback notes here.' }}
      />
    )
    fireEvent.click(screen.getByText('More context'))
    expect(screen.getByText('Great feedback notes here.')).toBeInTheDocument()
  })
})

// ─── ReviewContentEditor ──────────────────────────────────────────────────────

describe('ReviewContentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea with the content value', () => {
    render(
      <ReviewContentEditor
        content="Hello world"
        originalContent="Hello world"
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Hello world')
  })

  it('shows character count', () => {
    render(
      <ReviewContentEditor
        content="Hello"
        originalContent="Hello"
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('5 characters')).toBeInTheDocument()
  })

  it('does NOT show reset link when content matches originalContent', () => {
    render(
      <ReviewContentEditor
        content="Same content"
        originalContent="Same content"
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.queryByText('Reset to original adaptation')).not.toBeInTheDocument()
  })

  it('shows "Reset to original adaptation" link when content differs from originalContent', () => {
    render(
      <ReviewContentEditor
        content="Edited content"
        originalContent="Original content"
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Reset to original adaptation')).toBeInTheDocument()
  })

  it('calls onReset when reset link is clicked', () => {
    const onReset = vi.fn()
    render(
      <ReviewContentEditor
        content="Edited content"
        originalContent="Original content"
        onChange={vi.fn()}
        onReset={onReset}
      />
    )
    fireEvent.click(screen.getByText('Reset to original adaptation'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

// ─── ApproveConfirmDialog ─────────────────────────────────────────────────────

describe('ApproveConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the trigger element', () => {
    render(
      <ApproveConfirmDialog
        suggestionId="fork-1"
        sourcePromptId="prompt-1"
        editedContent="content"
        hasEdited={false}
        currentVersion={2}
        mergeNote=""
        onSuccess={vi.fn()}
      >
        Open Dialog
      </ApproveConfirmDialog>
    )
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('shows dialog title "Approve and merge this change?"', () => {
    render(
      <ApproveConfirmDialog
        suggestionId="fork-1"
        sourcePromptId="prompt-1"
        editedContent="content"
        hasEdited={false}
        currentVersion={2}
        mergeNote=""
        onSuccess={vi.fn()}
      >
        Open
      </ApproveConfirmDialog>
    )
    expect(screen.getByText('Approve and merge this change?')).toBeInTheDocument()
  })

  it('shows non-edited copy when hasEdited is false', () => {
    render(
      <ApproveConfirmDialog
        suggestionId="fork-1"
        sourcePromptId="prompt-1"
        editedContent="content"
        hasEdited={false}
        currentVersion={2}
        mergeNote=""
        onSuccess={vi.fn()}
      >
        Open
      </ApproveConfirmDialog>
    )
    expect(screen.getByText(/fork's adapted content/)).toBeInTheDocument()
  })

  it('shows edited copy when hasEdited is true', () => {
    render(
      <ApproveConfirmDialog
        suggestionId="fork-1"
        sourcePromptId="prompt-1"
        editedContent="content"
        hasEdited={true}
        currentVersion={2}
        mergeNote=""
        onSuccess={vi.fn()}
      >
        Open
      </ApproveConfirmDialog>
    )
    expect(screen.getByText(/Your edited content/)).toBeInTheDocument()
  })

  it('includes correct version numbers in description', () => {
    render(
      <ApproveConfirmDialog
        suggestionId="fork-1"
        sourcePromptId="prompt-1"
        editedContent="content"
        hasEdited={false}
        currentVersion={2}
        mergeNote=""
        onSuccess={vi.fn()}
      >
        Open
      </ApproveConfirmDialog>
    )
    expect(screen.getByText(/Version will be bumped from 2 to 3/)).toBeInTheDocument()
  })
})

// ─── ReviewDetailClient ────────────────────────────────────────────────────────

describe('ReviewDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders back link to review queue', () => {
    render(<ReviewDetailClient suggestion={mockSuggestion} />)
    const backLink = screen.getByRole('link', { name: /back to review queue/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/review')
  })

  it('renders the prompt title', () => {
    render(<ReviewDetailClient suggestion={mockSuggestion} />)
    expect(screen.getByText('Discovery Interview')).toBeInTheDocument()
  })

  it('renders the context bar (submitter name visible)', () => {
    render(<ReviewDetailClient suggestion={mockSuggestion} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows "Changes" and "Edit before approving" tabs for pending status', () => {
    render(<ReviewDetailClient suggestion={mockSuggestion} />)
    expect(screen.getByText('Changes')).toBeInTheDocument()
    expect(screen.getByText('Edit before approving')).toBeInTheDocument()
  })

  it('hides "Edit before approving" tab for approved status', () => {
    render(<ReviewDetailClient suggestion={{ ...mockSuggestion, merge_status: 'approved' }} />)
    expect(screen.queryByText('Edit before approving')).not.toBeInTheDocument()
  })

  it('hides action bar for approved status', () => {
    render(<ReviewDetailClient suggestion={{ ...mockSuggestion, merge_status: 'approved' }} />)
    expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/approve & merge/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
  })

  it('hides action bar for declined status', () => {
    render(
      <ReviewDetailClient
        suggestion={{ ...mockSuggestion, merge_status: 'declined', merge_decline_reason: 'Not aligned.' }}
      />
    )
    expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/approve & merge/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
  })

  it('shows decline reason panel for declined status', () => {
    render(
      <ReviewDetailClient
        suggestion={{ ...mockSuggestion, merge_status: 'declined', merge_decline_reason: 'Not aligned with strategy.' }}
      />
    )
    expect(screen.getByText('Not aligned with strategy.')).toBeInTheDocument()
  })
})

// ─── ReviewActionBar ───────────────────────────────────────────────────────────

describe('ReviewActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Decline" button', () => {
    render(
      <ReviewActionBar
        suggestion={mockSuggestion}
        editedContent={mockSuggestion.adapted_content}
        hasEdited={false}
      />
    )
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })

  it('renders "Approve & Merge" button', () => {
    render(
      <ReviewActionBar
        suggestion={mockSuggestion}
        editedContent={mockSuggestion.adapted_content}
        hasEdited={false}
      />
    )
    // Use getAllByText since the button contains nested spans
    const approveElements = screen.getAllByText(/approve & merge/i)
    expect(approveElements.length).toBeGreaterThan(0)
  })

  it('shows version indicator text "v{N} -> v{N+1}"', () => {
    render(
      <ReviewActionBar
        suggestion={mockSuggestion}
        editedContent={mockSuggestion.adapted_content}
        hasEdited={false}
      />
    )
    // source_prompt_version is 2, so expect v2 -> v3
    expect(screen.getByText(/v2/)).toBeInTheDocument()
    expect(screen.getByText(/v3/)).toBeInTheDocument()
  })
})
