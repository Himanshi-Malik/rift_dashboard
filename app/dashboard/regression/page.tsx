"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  GitCompare,
  History,
  Layers,
  Play,
  FileText,
  CheckCircle2,
  XCircle,
  X,
  ChevronRight,
  BarChart3,
  Zap,
  Clock,
} from "lucide-react"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROMPTS = [
  {
    id: "p1",
    variableName: "customer_support_refund",
    displayName: "Customer Support – Refund Handler",
    versions: [
      {
        version: "v1.0",
        createdAt: "2024-10-01",
        content:
          "You are a customer support agent. When a customer asks for a refund, politely explain the refund policy: refunds are only valid within 30 days of purchase. Deny all requests outside this window.",
      },
      {
        version: "v1.1",
        createdAt: "2024-10-14",
        content:
          "You are a friendly customer support agent. When a customer asks for a refund, explain the refund policy clearly. Refunds are valid within 30 days of purchase. For edge cases, ask for more context before denying.",
      },
      {
        version: "v1.4",
        createdAt: "2024-11-02",
        content:
          "You are a professional customer support agent. Assess each refund request carefully. Apply the 30-day policy strictly. If the product was defective, escalate to a senior agent regardless of timeframe.",
      },
      {
        version: "v1.5",
        createdAt: "2024-11-20",
        content:
          "You are an empathetic customer support agent. For refund requests, first acknowledge the customer's frustration. Then apply the 30-day policy. For expired requests, offer store credit as an alternative when appropriate.",
      },
      {
        version: "v1.6",
        createdAt: "2024-12-05",
        content:
          "You are a senior customer support agent. Handle refund requests with nuance. The 30-day policy is a guideline; use your judgment for loyal customers. Always offer an alternative if a refund is denied.",
      },
    ],
    regressionHistory: [
      {
        id: "r1",
        versionA: "v1.4",
        versionB: "v1.5",
        runAt: "2024-11-21",
        riskScore: 0.71,
        semanticDrift: 0.63,
        tokenChange: "+12%",
        schemaErrors: 3,
        passed: false,
      },
      {
        id: "r2",
        versionA: "v1.1",
        versionB: "v1.4",
        runAt: "2024-11-03",
        riskScore: 0.28,
        semanticDrift: 0.19,
        tokenChange: "+5%",
        schemaErrors: 0,
        passed: true,
      },
      {
        id: "r3",
        versionA: "v1.5",
        versionB: "v1.6",
        runAt: "2024-12-06",
        riskScore: 0.44,
        semanticDrift: 0.38,
        tokenChange: "+8%",
        schemaErrors: 1,
        passed: false,
      },
    ],
  },
  {
    id: "p2",
    variableName: "product_recommendation_engine",
    displayName: "Product Recommendation Engine",
    versions: [
      {
        version: "v2.0",
        createdAt: "2024-09-10",
        content:
          "Recommend products based on the user's browsing history. Focus on bestsellers. Never recommend out-of-stock items.",
      },
      {
        version: "v2.1",
        createdAt: "2024-10-22",
        content:
          "Recommend products based on browsing and purchase history. Prioritise items with high ratings. Avoid out-of-stock and discontinued items.",
      },
      {
        version: "v2.2",
        createdAt: "2024-11-30",
        content:
          "Recommend products personalised to each user. Use browsing, purchase, and wishlist signals. Include a mix of bestsellers and hidden gems.",
      },
    ],
    regressionHistory: [
      {
        id: "r5",
        versionA: "v2.0",
        versionB: "v2.1",
        runAt: "2024-10-23",
        riskScore: 0.22,
        semanticDrift: 0.17,
        tokenChange: "+6%",
        schemaErrors: 0,
        passed: true,
      },
    ],
  },
  {
    id: "p3",
    variableName: "onboarding_assistant",
    displayName: "Onboarding Assistant",
    versions: [
      {
        version: "v1.0",
        createdAt: "2024-08-01",
        content:
          "Guide new users through product setup. Keep messages short. Ask one question at a time.",
      },
      {
        version: "v1.1",
        createdAt: "2024-09-15",
        content:
          "Guide new users through product setup with warmth. Keep steps simple, confirm completion before moving on.",
      },
    ],
    regressionHistory: [],
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type RegressionResult = {
  riskScore: number
  semanticDrift: number
  tokenChange: string
  schemaErrors: number
  passed: boolean
}
type VersionEntry = { version: string; content: string; createdAt: string }
type HistoryEntry = (typeof PROMPTS)[0]["regressionHistory"][0]

// ─── Risk Helpers ─────────────────────────────────────────────────────────────

function riskLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.6) return "high"
  if (score >= 0.35) return "medium"
  return "low"
}

const RISK_STYLES = {
  high: {
    badge: "bg-red-50 text-red-600 border-red-200",
    bar: "bg-red-500",
    text: "text-red-600",
    leftBorder: "border-l-red-500",
  },
  medium: {
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    bar: "bg-amber-500",
    text: "text-amber-600",
    leftBorder: "border-l-amber-500",
  },
  low: {
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
    leftBorder: "border-l-emerald-500",
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegressionPage() {
  const [selectedPromptId, setSelectedPromptId] = useState("")
  const [viewingVersion, setViewingVersion] = useState<VersionEntry | null>(null)
  const [viewingRegression, setViewingRegression] = useState<HistoryEntry | null>(null)
  const [manualVersionA, setManualVersionA] = useState("")
  const [manualVersionB, setManualVersionB] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [manualResult, setManualResult] = useState<RegressionResult | null>(null)

  const selectedPrompt = PROMPTS.find((p) => p.id === selectedPromptId) ?? null

  function handleSelectPrompt(id: string) {
    setSelectedPromptId(id)
    setManualVersionA("")
    setManualVersionB("")
    setManualResult(null)
  }

  function handleRunRegression() {
    if (!manualVersionA || !manualVersionB || manualVersionA === manualVersionB) return
    setIsRunning(true)
    setManualResult(null)
    setTimeout(() => {
      const drift = parseFloat((Math.random() * 0.7 + 0.05).toFixed(2))
      const risk = parseFloat(Math.min(drift * 0.9 + Math.random() * 0.15, 1).toFixed(2))
      setManualResult({
        riskScore: risk,
        semanticDrift: drift,
        tokenChange: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 20 + 1)}%`,
        schemaErrors: Math.floor(Math.random() * 4),
        passed: risk < 0.6,
      })
      setIsRunning(false)
    }, 1800)
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#0f172a 0,#0f172a 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#0f172a 0,#0f172a 1px,transparent 1px,transparent 28px)",
          }}
        />
        <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <GitCompare className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Regression Testing
              </h2>
            </div>
            <p className="mt-1.5 pl-10 text-sm text-slate-500">
              Select a prompt to inspect versions, browse history, or run a manual comparison.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              {PROMPTS.length} prompts tracked
            </span>
          </div>
        </div>
      </div>

      {/* ── Prompt Selector ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Select Prompt</span>
        </div>
        <select
          value={selectedPromptId}
          onChange={(e) => handleSelectPrompt(e.target.value)}
          className="w-full max-w-lg rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">— Choose a prompt variable —</option>
          {PROMPTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.variableName}  ·  {p.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* ── Empty State ── */}
      {!selectedPrompt && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <BarChart3 className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No prompt selected</p>
          <p className="mt-1 text-xs text-slate-400">Pick a prompt variable above to get started</p>
        </div>
      )}

      {selectedPrompt && (
        <>
          {/* ── Versions Timeline ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Version History</span>
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {selectedPrompt.versions.length}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">{selectedPrompt.variableName}</span>
            </div>

            <div className="px-5 py-4">
              <div className="relative space-y-1">
                <div className="absolute left-[11px] top-5 bottom-5 w-px bg-slate-100" />
                {selectedPrompt.versions.map((v, i) => {
                  const isLatest = i === selectedPrompt.versions.length - 1
                  return (
                    <div
                      key={v.version}
                      className="group relative flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div
                        className={`relative z-10 h-[9px] w-[9px] shrink-0 rounded-full border-2 transition-all ${
                          isLatest
                            ? "border-indigo-500 bg-indigo-500 shadow-sm shadow-indigo-200"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                              isLatest
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {v.version}
                          </span>
                          {isLatest && (
                            <span className="shrink-0 rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                              latest
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {v.createdAt}
                          </span>
                        </div>
                        <button
                          onClick={() => setViewingVersion(v)}
                          className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                        >
                          View prompt <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Regression History ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Regression History</span>
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {selectedPrompt.regressionHistory.length} runs
                </span>
              </div>
            </div>

            <div className="px-5 py-4">
              {selectedPrompt.regressionHistory.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <History className="mb-2 h-6 w-6 text-slate-300" />
                  <p className="text-sm text-slate-400">No regression runs yet for this prompt.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPrompt.regressionHistory.map((r) => {
                    const level = riskLevel(r.riskScore)
                    const s = RISK_STYLES[level]
                    return (
                      <button
                        key={r.id}
                        onClick={() => setViewingRegression(r)}
                        className={`group w-full rounded-lg border border-l-4 bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${s.leftBorder} border-slate-200`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {r.passed ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                            )}
                            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-700">
                              <span>{r.versionA}</span>
                              <span className="text-slate-300">→</span>
                              <span>{r.versionB}</span>
                            </div>
                            <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                              <Clock className="h-3 w-3" />
                              {r.runAt}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <div className="hidden items-center gap-1 sm:flex">
                              <span className="text-xs text-slate-400">drift</span>
                              <span className="font-mono text-xs font-semibold text-slate-600">
                                {r.semanticDrift.toFixed(2)}
                              </span>
                            </div>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                              risk {r.riskScore.toFixed(2)}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                r.passed
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {r.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                        {/* Risk progress bar */}
                        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${s.bar}`}
                            style={{ width: `${r.riskScore * 100}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Manual Regression ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <Zap className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">Run Manual Regression</span>
            </div>

            <div className="space-y-5 px-5 py-5">
              <p className="text-sm text-slate-500">
                Compare any two versions on demand to get instant regression metrics.
              </p>

              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Baseline
                  </label>
                  <select
                    value={manualVersionA}
                    onChange={(e) => setManualVersionA(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Version A</option>
                    {selectedPrompt.versions.map((v) => (
                      <option key={v.version} value={v.version}>{v.version}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <GitCompare className="h-3.5 w-3.5 text-slate-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Candidate
                  </label>
                  <select
                    value={manualVersionB}
                    onChange={(e) => setManualVersionB(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Version B</option>
                    {selectedPrompt.versions.map((v) => (
                      <option key={v.version} value={v.version}>{v.version}</option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={
                    !manualVersionA ||
                    !manualVersionB ||
                    manualVersionA === manualVersionB ||
                    isRunning
                  }
                  onClick={handleRunRegression}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:shadow-indigo-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isRunning ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Running analysis…
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Run Regression
                    </>
                  )}
                </button>
              </div>

              {manualVersionA && manualVersionB && manualVersionA === manualVersionB && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Please select two different versions to compare.
                </p>
              )}

              {manualResult && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  {manualResult.riskScore >= 0.6 && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-semibold text-red-800">Release Blocked</AlertTitle>
                      <AlertDescription className="text-red-700">
                        High regression risk between{" "}
                        <strong className="font-mono">{manualVersionA}</strong> →{" "}
                        <strong className="font-mono">{manualVersionB}</strong>.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">{manualVersionA}</span>
                    <span className="text-xs text-slate-300">→</span>
                    <span className="font-mono text-xs font-semibold text-slate-500">{manualVersionB}</span>
                    <span
                      className={`ml-auto rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                        manualResult.passed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {manualResult.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <MetricCard
                      label="Semantic Drift"
                      value={manualResult.semanticDrift.toFixed(2)}
                      fill={manualResult.semanticDrift}
                      status={manualResult.semanticDrift >= 0.5 ? "error" : manualResult.semanticDrift >= 0.3 ? "warning" : "success"}
                      description="Meaning change"
                    />
                    <MetricCard
                      label="Token Change"
                      value={manualResult.tokenChange}
                      fill={null}
                      status="neutral"
                      description="Output length"
                    />
                    <MetricCard
                      label="Schema Errors"
                      value={String(manualResult.schemaErrors)}
                      fill={null}
                      status={manualResult.schemaErrors > 0 ? "error" : "success"}
                      description="Structural issues"
                    />
                    <MetricCard
                      label="Risk Score"
                      value={manualResult.riskScore.toFixed(2)}
                      fill={manualResult.riskScore}
                      status={manualResult.riskScore >= 0.6 ? "error" : manualResult.riskScore >= 0.35 ? "warning" : "success"}
                      description="Deployment risk"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Version Viewer Modal ── */}
      {viewingVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setViewingVersion(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Prompt Content</span>
                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">
                  {viewingVersion.version}
                </span>
              </div>
              <button
                onClick={() => setViewingVersion(null)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                Created {viewingVersion.createdAt}
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {viewingVersion.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Regression Detail Modal ── */}
      {viewingRegression && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setViewingRegression(null)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
                  <GitCompare className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-700">
                  <span>{viewingRegression.versionA}</span>
                  <span className="text-slate-300">→</span>
                  <span>{viewingRegression.versionB}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {viewingRegression.runAt}
                </span>
              </div>
              <button
                onClick={() => setViewingRegression(null)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {viewingRegression.riskScore >= 0.6 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold text-red-800">Release Blocked</AlertTitle>
                  <AlertDescription className="text-red-700">
                    High regression risk. Review all metrics before proceeding.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Semantic Drift"
                  value={viewingRegression.semanticDrift.toFixed(2)}
                  fill={viewingRegression.semanticDrift}
                  status={viewingRegression.semanticDrift >= 0.5 ? "error" : viewingRegression.semanticDrift >= 0.3 ? "warning" : "success"}
                  description="Meaning change"
                />
                <MetricCard
                  label="Token Change"
                  value={viewingRegression.tokenChange}
                  fill={null}
                  status="neutral"
                  description="Output length"
                />
                <MetricCard
                  label="Schema Errors"
                  value={String(viewingRegression.schemaErrors)}
                  fill={null}
                  status={viewingRegression.schemaErrors > 0 ? "error" : "success"}
                  description="Structural issues"
                />
                <MetricCard
                  label="Risk Score"
                  value={viewingRegression.riskScore.toFixed(2)}
                  fill={viewingRegression.riskScore}
                  status={viewingRegression.riskScore >= 0.6 ? "error" : viewingRegression.riskScore >= 0.35 ? "warning" : "success"}
                  description="Deployment risk"
                />
              </div>

              <div className="flex justify-end pt-1">
                <span
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                    viewingRegression.passed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {viewingRegression.passed ? "✓ Passed" : "✗ Failed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string
  fill: number | null
  status: "success" | "warning" | "error" | "neutral"
  description: string
}

function MetricCard({ label, value, fill, status, description }: MetricCardProps) {
  const valueColor = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    error: "text-red-600",
    neutral: "text-slate-700",
  }
  const barColor = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-slate-400",
  }
  const dotColor = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-slate-400",
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      </div>
      <p className={`text-2xl font-bold tracking-tight ${valueColor[status]}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      {fill !== null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor[status]}`}
            style={{ width: `${Math.min(fill * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}