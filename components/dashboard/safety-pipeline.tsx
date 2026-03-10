"use client"

// components/dashboard/safety-pipeline.tsx
// ─── Three-stage pipeline: Stable → Candidate Testing → Production ────────────

import { useDashboardData } from "@/hooks/useDashboardData"
import { CheckCircle2, Clock, Zap, ChevronRight } from "lucide-react"

const USERNAME = "demo-user"

interface StageProps {
  icon: React.ReactNode
  label: string
  count: number | string
  iconBg: string
  iconColor: string
  isLast?: boolean
}

function Stage({ icon, label, count, iconBg, iconColor, isLast }: StageProps) {
  return (
    <div className="flex flex-1 items-center">
      {/* Stage block */}
      <div className="flex flex-1 flex-col items-center gap-2 py-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`text-2xl font-bold tabular-nums ${iconColor}`}>{count}</span>
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
      )}
    </div>
  )
}

export function SafetyPipeline() {
  const { dashboardData, isLoading } = useDashboardData(USERNAME)

  const stable     = isLoading ? "—" : dashboardData.filter((p) => p.status === "Stable").length
  const testing    = isLoading ? "—" : dashboardData.filter((p) => p.status === "Testing" || p.status === "Failed").length
  const production = isLoading ? "—" : dashboardData.length   // all prompts are "in production" once they have a stable version

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <span className="text-sm font-semibold text-slate-700">Safety Pipeline</span>
      </div>

      <div className="flex items-center px-6 py-2">
        <Stage
          icon={<Clock className="h-5 w-5" />}
          label="Stable"
          count={stable}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
        />
        <Stage
          icon={<Clock className="h-5 w-5" />}
          label="Candidate Testing"
          count={testing}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
        />
        <Stage
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Production"
          count={production}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          isLast
        />
      </div>
    </div>
  )
}