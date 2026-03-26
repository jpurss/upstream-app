'use client'

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  value: number
  label: string
  subLines?: string[]
}

export function MetricCard({ icon: Icon, value, label, subLines }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-md p-6 flex flex-col gap-3 min-h-[120px]">
      <Icon className="size-5 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <span className="text-[28px] font-semibold text-foreground leading-[1.1]">{value}</span>
        <span className="text-[13px] text-muted-foreground leading-[1.4]">{label}</span>
        {subLines && subLines.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-1">
            {subLines.map((line, i) => (
              <span key={i} className="text-[13px] text-muted-foreground leading-[1.4]">
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
