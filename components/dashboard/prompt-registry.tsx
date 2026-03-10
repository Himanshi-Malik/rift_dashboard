"use client"

// src/components/dashboard/prompt-registry.tsx
// ─── Prompt Registry table — wired to real backend data ──────────────────────

import { useDashboardData, type DashboardRow } from "@/hooks/useDashboardData"
import { Loader2, AlertTriangle, CheckCircle2, Clock, FlaskConical } from "lucide-react"

// ─── Config: replace with real auth/session when ready ───────────────────────
const USERNAME = "demo-user"

// ─── Types (keep for parent page compatibility) ───────────────────────────────
export type Prompt = DashboardRow

// ─── Status helpers ───────────────────────────────────────────────────────────

type Status = "Stable" | "Testing" | "Failed"

const STATUS_STYLES: Record<Status, { badge: string; dot: string; icon: React.ReactNode }> = {
  Stable: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Testing: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: <Clock className="h-3 w-3" />,
  },
  Failed: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromptRegistryProps {
  selectedPrompt: Prompt | null
  onSelectPrompt: (prompt: Prompt) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromptRegistry({ selectedPrompt, onSelectPrompt }: PromptRegistryProps) {
  const { dashboardData, isLoading, error } = useDashboardData(USERNAME)

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-14 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        <span className="ml-2.5 text-sm text-slate-500">Loading prompts…</span>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-800">Backend unreachable</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // ── Empty ──
  if (dashboardData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-14">
        <FlaskConical className="mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">No prompts found</p>
        <p className="mt-1 text-xs text-slate-400">
          Create a prompt via the API to get started.
        </p>
      </div>
    )
  }

  // ── Table ──
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
        {["Prompt", "Stable", "Candidate", "Status", "Risk Δ"].map((h) => (
          <span key={h} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {dashboardData.map((row) => {
          const isSelected = selectedPrompt?.id === row.id
          const statusStyle = STATUS_STYLES[row.status]

          return (
            <button
              key={row.id}
              onClick={() => onSelectPrompt(row)}
              className={`grid w-full grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                isSelected ? "bg-indigo-50/60 hover:bg-indigo-50/80" : ""
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                {isSelected && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                )}
                <span
                  className={`truncate font-mono text-sm font-semibold ${
                    isSelected ? "text-indigo-700" : "text-slate-700"
                  }`}
                >
                  {row.name}
                </span>
              </div>

              {/* Stable version */}
              <div className="flex items-center">
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-700">
                  {row.stable_version}
                </span>
              </div>

              {/* Candidate version */}
              <div className="flex items-center">
                <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                  row.candidate_version === "-"
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}>
                  {row.candidate_version}
                </span>
              </div>

              {/* Status badge */}
              <div className="flex items-center">
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}
                >
                  {statusStyle.icon}
                  {row.status}
                </span>
              </div>

              {/* Risk delta */}
              <div className="flex items-center">
                <span
                  className={`font-mono text-xs font-bold ${
                    row.risk_score > 0.6
                      ? "text-red-600"
                      : row.risk_score > 0.35
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {row.risk_delta}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer count */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5">
        <span className="text-xs text-slate-400">
          {dashboardData.length} prompt{dashboardData.length !== 1 ? "s" : ""} registered
        </span>
      </div>
    </div>
  )
}