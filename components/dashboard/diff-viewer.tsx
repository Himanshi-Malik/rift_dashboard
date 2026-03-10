"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, ShieldCheck, ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prompt } from "./prompt-registry"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── API types ────────────────────────────────────────────────────────────────

interface RawVersion {
  id: string
  version_no: string
  status: string
  system_prompt: string
  prompt_template?: string
  output_schema?: string
  created_at?: string
}

interface RawRegression {
  id: string
  version1_id: string
  version2_id: string
  token_increase: number
  semantic_variance: number
  schema_failure_rate: number
  response_variance: number
  length_delta: number
  risk_score: number
  created_at?: string
}

interface PromptDetail {
  prompt: { id: string; name: string }
  versions: RawVersion[]
  regressions: RawRegression[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RiskScore({ score, label }: { score: number; label: string }) {
  // API stores risk_score as 0–1 float; display as 0–100
  const pct = Math.round(score * 100)
  const level = pct > 60 ? "high" : pct > 35 ? "medium" : "low"
  const cfg = {
    high:   { color: "text-red-600",     bar: "bg-red-500",     barBg: "bg-red-100",     icon: ShieldAlert  },
    medium: { color: "text-amber-600",   bar: "bg-amber-500",   barBg: "bg-amber-100",   icon: ShieldAlert  },
    low:    { color: "text-emerald-600", bar: "bg-emerald-500", barBg: "bg-emerald-100", icon: ShieldCheck  },
  }[level]
  const Icon = cfg.icon

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", cfg.color)} />
        <span className={cn("text-lg font-bold tabular-nums", cfg.color)}>{pct}</span>
      </div>
      <div className={cn("h-1.5 w-16 overflow-hidden rounded-full", cfg.barBg)}>
        <div className={cn("h-full rounded-full", cfg.bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Split a system prompt into bullet-like lines for the diff view
function toLines(text: string): string[] {
  return text
    .split(/\.(?=\s+[A-Z])|(?<=\.)(\s{2,})|[\n;]/)
    .map((s) => s?.trim())
    .filter(Boolean)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DiffViewerProps {
  prompt: Prompt
}

export function DiffViewer({ prompt }: DiffViewerProps) {
  const [detail, setDetail] = useState<PromptDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prompt?.id) return

    setIsLoading(true)
    setError(null)

    fetch(`${BASE}/api/prompts/${prompt.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: PromptDetail) => setDetail(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [prompt.id])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-md border border-slate-200 bg-white py-10 gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading diff…</span>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-4">
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
        <span className="text-xs text-red-600">Could not load diff: {error}</span>
      </div>
    )
  }

  if (!detail) return null

  const { versions, regressions } = detail

  // ── Not enough data ──
  if (versions.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white py-10">
        <p className="text-sm text-slate-400">Only one version exists — no diff to show yet.</p>
      </div>
    )
  }

  // Sort versions oldest→newest
  const sorted = [...versions].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Use last regression to drive risk scores; fall back to index-based pair
  const latestRegression = regressions.length > 0
    ? regressions[regressions.length - 1]
    : null

  // Resolve stable and candidate versions from the regression ids
  const stableVersion = latestRegression
    ? sorted.find((v) => v.id === latestRegression.version1_id) ?? sorted[sorted.length - 2]
    : sorted[sorted.length - 2]

  const candidateVersion = latestRegression
    ? sorted.find((v) => v.id === latestRegression.version2_id) ?? sorted[sorted.length - 1]
    : sorted[sorted.length - 1]

  const stableRisk  = latestRegression?.risk_score ?? 0
  const candidateRisk = latestRegression?.risk_score ?? 0
  // We want to show a "before" risk — use a synthetic lower value for stable
  // since we only store the regression result (delta), not per-version risk.
  // The seed doesn't store per-version scores so we approximate:
  // stable ≈ candidate - token_increase/500 (clamped to 0–1)
  const stableRiskApprox = latestRegression
    ? Math.max(0, latestRegression.risk_score - latestRegression.token_increase / 500)
    : 0

  const stableLines    = toLines(stableVersion.system_prompt)
  const candidateLines = toLines(candidateVersion.system_prompt)

  const delta = Math.round((candidateRisk - stableRiskApprox) * 100)
  const deltaClass =
    delta > 30 ? "bg-red-100 text-red-700 border-red-200"
    : delta > 15 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200"

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">

      {/* ── Risk comparison header ── */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-semibold text-slate-700">Risk Assessment</span>
          <div className="flex items-center gap-4 flex-wrap">
            <RiskScore score={stableRiskApprox} label="Stable" />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <RiskScore score={candidateRisk} label="Candidate" />
            <div className={cn("rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums", deltaClass)}>
              {delta > 0 ? "+" : ""}{delta} pts
            </div>
          </div>
        </div>

        {/* Regression metrics bar */}
        {latestRegression && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-slate-400">Token Δ</span>
              <span className="font-mono font-bold text-slate-700">+{latestRegression.token_increase.toFixed(0)}%</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-100">
              <span className="text-slate-400">Schema failures</span>
              <span className={cn("font-mono font-bold",
                latestRegression.schema_failure_rate > 0.5 ? "text-red-600"
                : latestRegression.schema_failure_rate > 0.2 ? "text-amber-600"
                : "text-emerald-600"
              )}>
                {(latestRegression.schema_failure_rate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400">Semantic Δ</span>
              <span className={cn("font-mono font-bold",
                latestRegression.semantic_variance > 0.6 ? "text-red-600"
                : latestRegression.semantic_variance > 0.3 ? "text-amber-600"
                : "text-emerald-600"
              )}>
                {(latestRegression.semantic_variance * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Side-by-side diff ── */}
      <div className="grid grid-cols-2 divide-x divide-slate-200">

        {/* Stable side */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2">
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-700">
              {stableVersion.version_no}
            </span>
            <span className="text-xs text-slate-500">stable</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed space-y-1">
            {stableLines.map((line, i) => {
              const removed = !candidateLines.includes(line)
              return (
                <div key={i} className={cn("rounded px-2 py-1", removed ? "bg-red-50 text-red-800" : "text-slate-700")}>
                  {removed && <span className="mr-2 font-bold text-red-500">−</span>}
                  <span className={cn(removed && "line-through")}>{line}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Candidate side */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2">
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-700">
              {candidateVersion.version_no}
            </span>
            <span className="text-xs text-slate-500">candidate</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed space-y-1">
            {candidateLines.map((line, i) => {
              const added = !stableLines.includes(line)
              return (
                <div key={i} className={cn("rounded px-2 py-1", added ? "bg-emerald-50 text-emerald-800" : "text-slate-700")}>
                  {added && <span className="mr-2 font-bold text-emerald-600">+</span>}
                  {line}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}