'use client'

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  value: number
  label: string
  subLines?: string[]
  accentColor?: string
}

export function MetricCard({ icon: Icon, value, label, subLines, accentColor = '#4287FF' }: MetricCardProps) {
  return (
    <div
      className="bg-card border border-border border-l-2 rounded-md p-4 flex flex-col gap-2"
      style={{ borderLeftColor: `${accentColor}4D` }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-[13px] text-muted-foreground leading-[1.4]">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[24px] font-semibold text-foreground leading-[1.1]">{value}</span>
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
