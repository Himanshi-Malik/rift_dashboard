"use client"

import { useEffect, useState } from "react"
import { GitBranch, CheckCircle2, Clock, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prompt } from "./prompt-registry"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface RawVersion {
  id: string
  prompt_id: string
  version_no: string
  status: string
  system_prompt: string
  prompt_template: string
  output_schema: string
  created_at?: string
}

const statusConfig: Record<string, {
  label: string
  icon: React.ElementType
  badgeClass: string
  iconClass: string
  ringClass: string
  bgClass: string
}> = {
  stable: {
    label: "Stable",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconClass: "text-emerald-500",
    ringClass: "border-emerald-500",
    bgClass: "bg-emerald-50",
  },
  candidate: {
    label: "Candidate",
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
    ringClass: "border-amber-500",
    bgClass: "bg-amber-50",
  },
  "rolled-back": {
    label: "Rolled back",
    icon: RotateCcw,
    badgeClass: "bg-slate-50 text-slate-500 border-slate-200",
    iconClass: "text-slate-400",
    ringClass: "border-slate-300",
    bgClass: "bg-slate-50",
  },
}

function resolveStatus(raw: string) {
  const key = raw?.toLowerCase()
  return statusConfig[key] ?? statusConfig["candidate"]
}

function formatDate(raw?: string) {
  if (!raw) return "—"
  try {
    return new Date(raw).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return raw
  }
}

interface VersionHistoryProps {
  prompt: Prompt
}

export function VersionHistory({ prompt }: VersionHistoryProps) {
  const [versions, setVersions] = useState<RawVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prompt?.id) return

    setIsLoading(true)
    setError(null)

    // ✅ Fixed: call /api/prompts/{id} and extract versions from response
    fetch(`${BASE}/api/prompts/${prompt.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { versions: RawVersion[] }) => {
        const sorted = [...(data.versions ?? [])].sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setVersions(sorted)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [prompt.id])

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <GitBranch className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Version History</span>
        <span className="ml-auto font-mono text-xs text-slate-400">{prompt.name}</span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading versions…</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center gap-3 px-4 py-4 text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="text-xs">Could not load versions: {error}</span>
        </div>
      )}

      {!isLoading && !error && versions.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          No versions found for this prompt.
        </div>
      )}

      {!isLoading && !error && versions.length > 0 && (
        <div className="divide-y divide-slate-100">
          {versions.map((v, index) => {
            const cfg = resolveStatus(v.status)
            const StatusIcon = cfg.icon
            const isLatest = index === 0

            return (
              <div
                key={v.id}
                className={cn(
                  "flex items-start justify-between px-4 py-3",
                  isLatest && "bg-slate-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        cfg.ringClass,
                        cfg.bgClass
                      )}
                    >
                      <StatusIcon className={cn("h-4 w-4", cfg.iconClass)} />
                    </div>
                    {index < versions.length - 1 && (
                      <div className="mt-1 h-6 w-0.5 bg-slate-200" />
                    )}
                  </div>

                  <div className="flex flex-col pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {v.version_no}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                          cfg.badgeClass
                        )}
                      >
                        {cfg.label}
                      </span>
                      {isLatest && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-200">
                          latest
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                      {v.system_prompt}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 pt-1 text-xs font-medium text-slate-400">
                  {formatDate(v.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}