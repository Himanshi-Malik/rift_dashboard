"use client"

import { Check, Clock, AlertTriangle, Ban, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PipelineStage {
  id: string
  label: string
  status: "complete" | "active" | "warning" | "blocked" | "pending"
  count: number
}

// need api call for stable and candidate counts
const stages: PipelineStage[] = [
  { id: "stable", label: "Stable", status: "active", count: 3 },
  { id: "testing", label: "Candidate Testing", status: "active", count: 4 },
  { id: "prod", label: "Production", status: "complete", count: 7 },
]

const statusConfig = {
  complete: { icon: Check, bg: "bg-emerald-500", ring: "ring-emerald-100", text: "text-emerald-600", countBg: "bg-emerald-50" },
  active: { icon: Clock, bg: "bg-blue-500", ring: "ring-blue-100", text: "text-blue-600", countBg: "bg-blue-50" },
  warning: { icon: AlertTriangle, bg: "bg-amber-500", ring: "ring-amber-100", text: "text-amber-600", countBg: "bg-amber-50" },
  blocked: { icon: Ban, bg: "bg-red-500", ring: "ring-red-100", text: "text-red-600", countBg: "bg-red-50" },
  pending: { icon: Clock, bg: "bg-slate-300", ring: "ring-slate-100", text: "text-slate-400", countBg: "bg-slate-50" },
}

export function SafetyPipeline() {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
        <span className="text-sm font-semibold text-slate-800">Safety Pipeline</span>
      </div>
      <div className="flex items-stretch">
        {stages.map((stage, index) => {
          const config = statusConfig[stage.status]
          const Icon = config.icon
          const isLast = index === stages.length - 1
          return (
            <div key={stage.id} className={cn("relative flex flex-1 items-center", !isLast && "border-r border-slate-100")}>
              <div className="flex w-full flex-col items-center gap-1.5 px-3 py-4">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full ring-4", config.bg, config.ring)}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-slate-700">{stage.label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", config.countBg, config.text)}>
                  {stage.count}
                </span>
              </div>
              {!isLast && (
                <ChevronRight className="absolute -right-2 z-10 h-4 w-4 text-slate-300" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
