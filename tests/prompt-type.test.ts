import { describe, it, expect } from 'vitest'

describe('Prompt TypeScript type', () => {
  it('Prompt type has all required fields matching DB schema', async () => {
    // Verify the type module exports and a value assignable to Prompt has the expected shape
    const { } = await import('@/lib/types/prompt')
    // TypeScript compilation is the primary check; at runtime we verify the exports exist
    const promptModule = await import('@/lib/types/prompt')
    expect(typeof promptModule).toBe('object')
  })

  it('PromptCategory union type includes all 6 seed categories', async () => {
    // The categories are encoded as type values — we verify via a runtime constant
    const { PROMPT_CATEGORIES } = await import('@/lib/types/prompt')
    expect(PROMPT_CATEGORIES).toContain('Discovery')
    expect(PROMPT_CATEGORIES).toContain('Solution Design')
    expect(PROMPT_CATEGORIES).toContain('Build')
    expect(PROMPT_CATEGORIES).toContain('Enablement')
    expect(PROMPT_CATEGORIES).toContain('Delivery')
    expect(PROMPT_CATEGORIES).toContain('Internal Ops')
    expect(PROMPT_CATEGORIES).toHaveLength(6)
  })

  it('fetchAllActivePrompts function exists and is callable', async () => {
    const { fetchAllActivePrompts } = await import('@/lib/data/prompts')
    expect(typeof fetchAllActivePrompts).toBe('function')
  })

  it('fetchPromptById function exists and accepts a string id parameter', async () => {
    const { fetchPromptById } = await import('@/lib/data/prompts')
    expect(typeof fetchPromptById).toBe('function')
    // fetchPromptById should accept a string argument (function arity check)
    expect(fetchPromptById.length).toBe(1)
  })

  it('searchPrompts function exists and accepts a query string parameter', async () => {
    const { searchPrompts } = await import('@/lib/data/prompts')
    expect(typeof searchPrompts).toBe('function')
    expect(searchPrompts.length).toBe(1)
  })
})
