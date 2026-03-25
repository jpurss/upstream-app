'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Checks if the current user is an admin (real or demo).
 * Returns the user object if admin, or null if not.
 */
async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  if (effectiveRole !== 'admin') return null
  return { user, supabase }
}

/**
 * Creates a new prompt in the database.
 * Admin-only. Redirects to /library on success.
 */
export async function createPrompt(formData: FormData) {
  const adminCtx = await getAdminUser()
  if (!adminCtx) {
    return { error: 'Unauthorized' }
  }

  const { user, supabase } = adminCtx

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const capability_type = formData.get('capability_type') as string
  const industryTagsRaw = formData.get('industry_tags') as string
  const useCaseTagsRaw = formData.get('use_case_tags') as string
  const target_model = formData.get('target_model') as string
  const complexity = formData.get('complexity') as string
  const input_schema = formData.get('input_schema') as string
  const output_schema = formData.get('output_schema') as string

  const industry_tags = industryTagsRaw
    ? industryTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  const use_case_tags = useCaseTagsRaw
    ? useCaseTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const { error } = await supabase.from('prompts').insert({
    title,
    description: description || null,
    content,
    category,
    capability_type,
    industry_tags,
    use_case_tags,
    target_model: target_model || 'model-agnostic',
    complexity: complexity || 'moderate',
    input_schema: input_schema || null,
    output_schema: output_schema || null,
    created_by: user.id,
    status: 'active',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/library')
  redirect('/library')
}

/**
 * Updates an existing prompt in the database.
 * Admin-only. Redirects to the prompt detail page on success.
 */
export async function updatePrompt(promptId: string, formData: FormData) {
  const adminCtx = await getAdminUser()
  if (!adminCtx) {
    return { error: 'Unauthorized' }
  }

  const { supabase } = adminCtx

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const capability_type = formData.get('capability_type') as string
  const industryTagsRaw = formData.get('industry_tags') as string
  const useCaseTagsRaw = formData.get('use_case_tags') as string
  const target_model = formData.get('target_model') as string
  const complexity = formData.get('complexity') as string
  const input_schema = formData.get('input_schema') as string
  const output_schema = formData.get('output_schema') as string

  const industry_tags = industryTagsRaw
    ? industryTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  const use_case_tags = useCaseTagsRaw
    ? useCaseTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('prompts')
    .update({
      title,
      description: description || null,
      content,
      category,
      capability_type,
      industry_tags,
      use_case_tags,
      target_model: target_model || 'model-agnostic',
      complexity: complexity || 'moderate',
      input_schema: input_schema || null,
      output_schema: output_schema || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', promptId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/library')
  revalidatePath(`/library/${promptId}`)
  redirect(`/library/${promptId}`)
}

/**
 * Marks a prompt as deprecated.
 * Admin-only. Returns success or error — does NOT redirect (called from client dialog).
 */
export async function deprecatePrompt(promptId: string) {
  const adminCtx = await getAdminUser()
  if (!adminCtx) {
    return { error: 'Unauthorized' }
  }

  const { supabase } = adminCtx

  const { error } = await supabase
    .from('prompts')
    .update({ status: 'deprecated' })
    .eq('id', promptId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/library')
  revalidatePath(`/library/${promptId}`)
  return { success: true }
}
