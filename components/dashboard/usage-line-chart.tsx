'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { UsageDataPoint } from '@/lib/data/dashboard'

interface UsageLineChartProps {
  data: UsageDataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '8px 12px',
      }}
    >
      <p style={{ color: 'oklch(0.985 0 0)', fontSize: '13px', margin: 0 }}>
        {label}: {payload[0].value} checkouts
      </p>
    </div>
  )
}

export function UsageLineChart({ data }: UsageLineChartProps) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h2 className="text-[20px] font-semibold text-foreground mb-4">
        Prompt Usage Over Time
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="week"
            stroke="#27272a"
            tick={{ fill: '#71717a', fontSize: 13 }}
            axisLine={{ stroke: '#27272a' }}
            tickLine={false}
          />
          <YAxis
            stroke="#27272a"
            tick={{ fill: '#71717a', fontSize: 13 }}
            axisLine={{ stroke: '#27272a' }}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4287FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#4287FF', stroke: '#4287FF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
