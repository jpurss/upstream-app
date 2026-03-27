'use client'

interface ChartTooltipEntry {
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipEntry[]
  label?: string
  /** Suffix appended to single-value tooltips (e.g. " checkouts") */
  valueSuffix?: string
}

export function ChartTooltip({ active, payload, label, valueSuffix }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const isMultiEntry = payload.length > 1 || !valueSuffix

  return (
    <div
      style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '8px 12px',
      }}
    >
      {isMultiEntry ? (
        <>
          <p style={{ color: 'oklch(0.985 0 0)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>
            {label}
          </p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, fontSize: '13px', margin: '2px 0' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </>
      ) : (
        <p style={{ color: 'oklch(0.985 0 0)', fontSize: '13px', margin: 0 }}>
          {label}: {payload[0].value}{valueSuffix}
        </p>
      )}
    </div>
  )
}
