"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts"

const COLORS = ["#007A35", "#4C956C", "#78AA8C", "#A9C6B4", "#C8DDD0"]

export function RevenueLineChart({
  data,
}: {
  data: Array<{ date: string; membership: number; pt: number; addOn: number; total: number }>
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No revenue data recorded for selected period.
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007A35" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#007A35" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, "Revenue"]} />
          <Area type="monotone" dataKey="total" stroke="#007A35" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenuePieChart({
  membership,
  pt,
  addOn,
}: {
  membership: number
  pt: number
  addOn: number
}) {
  const pieData = [
    { name: "Membership", value: membership },
    { name: "PT Sessions", value: pt },
    { name: "Add-Ons", value: addOn },
  ].filter((item) => item.value > 0)

  if (pieData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No category revenue data.
      </div>
    )
  }

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-xs">
        {pieData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExpenseBudgetChart({
  data,
}: {
  data: Array<{ category: string; budget: number; actual: number; overBudget: boolean }>
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(val: any) => `$${Number(val || 0).toFixed(2)}`} />
          <Legend />
          <Bar dataKey="budget" name="Budget" fill="#78AA8C" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual Spend" fill="#007A35" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TrainerPayChart({
  level1,
  level2,
}: {
  level1: number
  level2: number
}) {
  const chartData = [
    { name: "Level 1 Trainers", amount: level1 },
    { name: "Level 2 Trainers", amount: level2 },
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(val: any) => `$${Number(val || 0).toFixed(2)}`} />
          <Bar dataKey="amount" fill="#4C956C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
