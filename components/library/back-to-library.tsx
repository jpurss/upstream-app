'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackToLibrary() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 transition-colors"
    >
      <ArrowLeft className="size-3.5" />
      Library
    </button>
  )
}
