'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { DemandDataPoint } from '@/lib/data/dashboard'
import { ChartTooltip } from '@/components/dashboard/chart-tooltip'

interface DemandBarChartProps {
  data: DemandDataPoint[]
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
      <h2 className="text-[16px] font-semibold text-foreground mb-4">Demand vs Supply</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={24} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={false} />
          <Bar
            dataKey="opened"
            name="Requests opened"
            fill="#FFB852"
            radius={[3, 3, 0, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="resolved"
            name="Resolved"
            fill="#65CFB2"
            radius={[3, 3, 0, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  )
}
