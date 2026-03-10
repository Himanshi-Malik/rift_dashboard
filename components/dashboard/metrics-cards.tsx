"use client"

// components/dashboard/metrics-cards.tsx
// ─── Overview row — Total Prompts / Stable / Testing ─────────────────────────

import { useDashboardData } from "@/hooks/useDashboardData"
import { Loader2 } from "lucide-react"

const USERNAME = "demo-user"

interface MetricCardProps {
  label: string
  value: number | string
  sub?: string
  progress?: number           // 0–100
  progressColor?: string
  valueColor?: string
  isLoading?: boolean
}

function MetricCard({
  label, value, sub, progress, progressColor = "bg-emerald-500",
  valueColor = "text-slate-900", isLoading,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      {isLoading ? (
        <Loader2 className="mt-3 h-5 w-5 animate-spin text-slate-300" />
      ) : (
        <>
          <p className={`mt-1 text-3xl font-bold tabular-nums ${valueColor}`}>{value}</p>
          {sub && (
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          )}
          {progress !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${progressColor}`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function MetricsCards() {
  const { dashboardData, isLoading } = useDashboardData(USERNAME)

  // Count versions by summing stable_version + candidate_version per prompt.
  // useDashboardData already fetches full detail per prompt (versions + regressions).
  // For the overview row we only need prompt-level counts:
  const total   = dashboardData.length
  const stable  = dashboardData.filter((p) => p.status === "Stable").length
  const testing = dashboardData.filter((p) => p.status === "Testing" || p.status === "Failed").length

  const stablePct  = total > 0 ? Math.round((stable  / total) * 100) : 0
  const testingPct = total > 0 ? Math.round((testing / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard
        label="Total Prompts"
        value={isLoading ? "—" : total}
        isLoading={isLoading}
      />
      <MetricCard
        label="Stable"
        value={isLoading ? "—" : `${stable} / ${total}`}
        progress={stablePct}
        progressColor="bg-emerald-500"
        valueColor="text-emerald-600"
        isLoading={isLoading}
      />
      <MetricCard
        label="Testing"
        value={isLoading ? "—" : `${testing} / ${total}`}
        progress={testingPct}
        progressColor="bg-amber-500"
        valueColor="text-amber-600"
        isLoading={isLoading}
      />
    </div>
  )
}