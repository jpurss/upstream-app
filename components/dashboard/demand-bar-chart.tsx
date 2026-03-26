'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import type { DemandDataPoint } from '@/lib/data/dashboard'

interface DemandBarChartProps {
  data: DemandDataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
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
      <p style={{ color: 'oklch(0.985 0 0)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', margin: '2px 0' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-4 justify-center mt-3">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: '#FFB852' }}
        />
        <span className="text-[13px] text-muted-foreground">Requests opened</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: '#65CFB2' }}
        />
        <span className="text-[13px] text-muted-foreground">Resolved</span>
      </div>
    </div>
  )
}

export function DemandBarChart({ data }: DemandBarChartProps) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h2 className="text-[20px] font-semibold text-foreground mb-4">Demand vs Supply</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="month"
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
          <Bar
            dataKey="opened"
            name="Requests opened"
            fill="#FFB852"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="resolved"
            name="Resolved"
            fill="#65CFB2"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  )
}
