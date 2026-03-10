"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Metric {
  label: string
  value: number
  suffix?: string
  change?: { value: number; direction: "up" | "down" | "neutral" }
  progress?: { current: number; total: number }
  status?: "success" | "warning" | "error" | "default"
  highlight?: boolean
}

// need api call for metrics
const metrics: Metric[] = [
  //keep variable names here for values..
  { label: "Total Prompts Versions", value: 12, status: "default", highlight: true },
  { label: "Stable", value: 8, progress: { current: 8, total: 12 }, status: "success" },
  { label: "Testing", value: 4, progress: { current: 4, total: 12 }, status: "warning" },
  { label: "Archived", value: 2, status: "error" },
]

const statusColors = {
  success: { value: "text-emerald-700", bg: "bg-emerald-500" },
  warning: { value: "text-amber-700", bg: "bg-amber-500" },
  error: { value: "text-red-700", bg: "bg-red-500" },
  default: { value: "text-slate-900", bg: "bg-slate-500" },
}

const changeColors = {
  up: { text: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
  down: { text: "text-red-600", bg: "bg-red-50", icon: TrendingDown },
  neutral: { text: "text-slate-500", bg: "bg-slate-50", icon: Minus },
}

export function MetricsCards() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {metrics.map((metric) => {
        const status = statusColors[metric.status || "default"]
        const progress = metric.progress
          ? Math.round((metric.progress.current / metric.progress.total) * 100)
          : null
        const change = metric.change ? changeColors[metric.change.direction] : null
        const ChangeIcon = change?.icon

        return (
          <div
            key={metric.label}
            className={cn(
              "rounded-md border bg-white p-3",
              metric.highlight ? "border-slate-300 shadow-sm" : "border-slate-200"
            )}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">{metric.label}</span>
              {metric.change && ChangeIcon && (
                <span className={cn("flex items-center gap-0.5 rounded px-1 py-0.5 text-xs font-medium", change?.bg, change?.text)}>
                  <ChangeIcon className="h-3 w-3" />
                  {metric.change.value}%
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold tabular-nums leading-none", status.value)}>
                {metric.value}
              </span>
              {metric.suffix && (
                <span className={cn("text-lg font-semibold", status.value)}>{metric.suffix}</span>
              )}
              {metric.progress && (
                <span className="text-sm text-slate-400">/ {metric.progress.total}</span>
              )}
            </div>
            {progress !== null && (
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all", status.bg)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
