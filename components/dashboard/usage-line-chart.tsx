'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { UsageDataPoint } from '@/lib/data/dashboard'
import { ChartTooltip } from '@/components/dashboard/chart-tooltip'

interface UsageLineChartProps {
  data: UsageDataPoint[]
}

export function UsageLineChart({ data }: UsageLineChartProps) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h2 className="text-[16px] font-semibold text-foreground mb-4">
        Prompt Usage Over Time
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip valueSuffix=" checkouts" />} cursor={false} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4287FF"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#4287FF', stroke: '#4287FF' }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
