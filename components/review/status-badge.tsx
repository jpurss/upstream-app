import { Clock, Check, X } from 'lucide-react'

const statusConfig = {
  pending: { bg: 'bg-[#FFB852]/15', text: 'text-[#FFB852]', icon: Clock, label: 'Pending Review' },
  approved: { bg: 'bg-[#65CFB2]/15', text: 'text-[#65CFB2]', icon: Check, label: 'Merged' },
  declined: { bg: 'bg-[#E3392A]/15', text: 'text-[#E3392A]', icon: X, label: 'Declined' },
} as const

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[13px] font-semibold ${config.bg} ${config.text}`}>
      <Icon className="size-3" />
      {config.label}
    </span>
  )
}
