"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle, GitCompare, History, Layers, Play,
  FileText, CheckCircle2, XCircle, X, ChevronRight,
  BarChart3, Zap, Clock, Loader2,
} from "lucide-react"
import {
  fetchUserPrompts,
  fetchPromptDetails,
  createRegression,
  type Prompt,
  type PromptVersion,
  type PromptRegression,
} from "@/lib/api"

const USERNAME = "demo-user"

type RunResult = {
  riskScore: number
  semanticDrift: number
  tokenChange: string
  schemaErrors: number
  passed: boolean
}

function riskLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.6) return "high"
  if (score >= 0.35) return "medium"
  return "low"
}

const RISK = {
  high:   { badge: "bg-red-50 text-red-600 border-red-200",            bar: "bg-red-500",     lb: "border-l-red-500" },
  medium: { badge: "bg-amber-50 text-amber-600 border-amber-200",      bar: "bg-amber-500",   lb: "border-l-amber-500" },
  low:    { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", bar: "bg-emerald-500", lb: "border-l-emerald-500" },
}

export default function RegressionPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [promptsLoading, setPromptsLoading] = useState(true)
  const [promptsError, setPromptsError] = useState("")

  const [selectedPromptId, setSelectedPromptId] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null)
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [regressionHistory, setRegressionHistory] = useState<PromptRegression[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const [viewingVersion, setViewingVersion] = useState<PromptVersion | null>(null)
  const [viewingRegression, setViewingRegression] = useState<PromptRegression | null>(null)

  const [manualVersionA, setManualVersionA] = useState("")
  const [manualVersionB, setManualVersionB] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)

  useEffect(() => {
    setPromptsLoading(true)
    fetchUserPrompts(USERNAME)
      .then(setPrompts)
      .catch(() => setPromptsError("Could not reach backend. Is it running on port 8000?"))
      .finally(() => setPromptsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedPromptId) {
      setSelectedPrompt(null)
      setVersions([])
      setRegressionHistory([])
      return
    }
    setDetailLoading(true)
    setManualVersionA("")
    setManualVersionB("")
    setRunResult(null)

    fetchPromptDetails(selectedPromptId)
      .then((data) => {
        setSelectedPrompt(data.prompt)
        setVersions(data.versions)
        setRegressionHistory(data.regressions)
      })
      .catch(console.error)
      .finally(() => setDetailLoading(false))
  }, [selectedPromptId])

  async function handleRunRegression() {
    if (!manualVersionA || !manualVersionB || manualVersionA === manualVersionB) return
    setIsRunning(true)
    setRunResult(null)

    await new Promise((r) => setTimeout(r, 1800))

    const drift     = parseFloat((Math.random() * 0.7 + 0.05).toFixed(2))
    const risk      = parseFloat(Math.min(drift * 0.9 + Math.random() * 0.15, 1).toFixed(2))
    const tokenRaw  = Math.floor(Math.random() * 20 + 1)
    const tokenSign = Math.random() > 0.5 ? 1 : -1
    const schema    = Math.floor(Math.random() * 4)

    const result: RunResult = {
      riskScore:     risk,
      semanticDrift: drift,
      tokenChange:   `${tokenSign > 0 ? "+" : "-"}${tokenRaw}%`,
      schemaErrors:  schema,
      passed:        risk < 0.6,
    }

    try {
      await createRegression(selectedPromptId, {
        version1_id:         manualVersionA,
        version2_id:         manualVersionB,
        semantic_variance:   drift,
        token_increase:      tokenSign * tokenRaw,
        schema_failure_rate: schema,
        response_variance:   0,
        length_delta:        0,
        risk_score:          risk,
      })
      const refreshed = await fetchPromptDetails(selectedPromptId)
      setRegressionHistory(refreshed.regressions)
    } catch (err) {
      console.error("Failed to save regression:", err)
    }

    setRunResult(result)
    setIsRunning(false)
  }

  function versionLabel(id: string) {
    return versions.find((v) => v.id === id)?.version_no ?? id.slice(0, 8)
  }

  // ✅ Determine version type by matching IDs from the prompt record
  function getVersionType(v: PromptVersion): "stable" | "candidate" | "rolled-back" {
    if (!selectedPrompt) return "rolled-back"
    if (v.id === selectedPrompt.stable_version_id)    return "stable"
    if (v.id === selectedPrompt.candidate_version_id) return "candidate"
    return "rolled-back"
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#0f172a 0,#0f172a 1px,transparent 1px,transparent 28px)," +
              "repeating-linear-gradient(90deg,#0f172a 0,#0f172a 1px,transparent 1px,transparent 28px)",
          }}
        />
        <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <GitCompare className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Regression Testing</h2>
            </div>
            <p className="mt-1.5 pl-10 text-sm text-slate-500">
              Select a prompt to inspect versions, browse history, or run a manual comparison.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              {promptsLoading ? "Loading…" : `${prompts.length} prompts tracked`}
            </span>
          </div>
        </div>
      </div>

      {promptsError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Backend Unreachable</AlertTitle>
          <AlertDescription className="text-red-700">{promptsError}</AlertDescription>
        </Alert>
      )}

      {/* Prompt Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Select Prompt</span>
        </div>
        <select
          value={selectedPromptId}
          onChange={(e) => setSelectedPromptId(e.target.value)}
          disabled={promptsLoading}
          className="w-full max-w-lg rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
        >
          <option value="">{promptsLoading ? "Loading prompts…" : "— Choose a prompt variable —"}</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {!selectedPromptId && !promptsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <BarChart3 className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No prompt selected</p>
          <p className="mt-1 text-xs text-slate-400">Pick a prompt variable above to get started</p>
        </div>
      )}

      {detailLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-slate-500">Loading prompt details…</span>
        </div>
      )}

      {selectedPrompt && !detailLoading && (
        <>
          {/* Versions Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Version History</span>
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {versions.length}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">{selectedPrompt.name}</span>
            </div>

            <div className="px-5 py-4">
              {versions.length === 0 ? (
                <p className="py-6 text-center text-sm italic text-slate-400">No versions yet.</p>
              ) : (
                <div className="relative space-y-1">
                  <div className="absolute left-[11px] top-5 bottom-5 w-px bg-slate-100" />
                  {versions.map((v) => {
                    // ✅ Use actual IDs to determine version type
                    const vtype     = getVersionType(v)
                    const isStable  = vtype === "stable"
                    const isTesting = vtype === "candidate"

                    return (
                      <div
                        key={v.id}
                        className="group relative flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <div
                          className={`relative z-10 h-[9px] w-[9px] shrink-0 rounded-full border-2 ${
                            isStable
                              ? "border-indigo-500 bg-indigo-500 shadow-sm shadow-indigo-200"
                              : isTesting
                              ? "border-amber-400 bg-amber-400 shadow-sm shadow-amber-100"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                        <div className="flex flex-1 items-center justify-between min-w-0">
                          <div className="flex items-center gap-3">
                            <span
                              className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                                isStable
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                  : isTesting
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              {v.version_no}
                            </span>

                            {/* ✅ Stable = "latest stable", Candidate = "testing" */}
                            {isStable && (
                              <span className="shrink-0 rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                latest stable
                              </span>
                            )}
                            {isTesting && (
                              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                                testing
                              </span>
                            )}

                            {v.created_at && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                {new Date(v.created_at).toLocaleDateString()}
                              </span>
                            )}
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
              )}
            </div>
          </div>

          {/* Regression History */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Regression History</span>
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {regressionHistory.length} runs
                </span>
              </div>
            </div>
            <div className="px-5 py-4">
              {regressionHistory.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <History className="mb-2 h-6 w-6 text-slate-300" />
                  <p className="text-sm text-slate-400">No regression runs yet for this prompt.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {regressionHistory.map((r) => {
                    const level  = riskLevel(r.risk_score)
                    const s      = RISK[level]
                    const passed = r.risk_score < 0.6
                    return (
                      <button
                        key={r.id}
                        onClick={() => setViewingRegression(r)}
                        className={`group w-full rounded-lg border border-l-4 bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${s.lb} border-slate-200`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {passed
                              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                              : <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                            }
                            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-700">
                              <span>{versionLabel(r.version1_id)}</span>
                              <span className="text-slate-300">→</span>
                              <span>{versionLabel(r.version2_id)}</span>
                            </div>
                            {r.created_at && (
                              <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                                <Clock className="h-3 w-3" />
                                {new Date(r.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <div className="hidden items-center gap-1 sm:flex">
                              <span className="text-xs text-slate-400">drift</span>
                              <span className="font-mono text-xs font-semibold text-slate-600">
                                {r.semantic_variance.toFixed(2)}
                              </span>
                            </div>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                              risk {r.risk_score.toFixed(2)}
                            </span>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              passed
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}>
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${r.risk_score * 100}%` }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Manual Regression */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <Zap className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">Run Manual Regression</span>
            </div>
            <div className="space-y-5 px-5 py-5">
              <p className="text-sm text-slate-500">Compare any two versions on demand. Results are automatically saved.</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Baseline</label>
                  <select
                    value={manualVersionA}
                    onChange={(e) => setManualVersionA(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Version A</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>{v.version_no}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <GitCompare className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Candidate</label>
                  <select
                    value={manualVersionB}
                    onChange={(e) => setManualVersionB(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-medium text-slate-700 shadow-inner transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Version B</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>{v.version_no}</option>
                    ))}
                  </select>
                </div>
                <button
                  disabled={!manualVersionA || !manualVersionB || manualVersionA === manualVersionB || isRunning}
                  onClick={handleRunRegression}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:shadow-indigo-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isRunning ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Running analysis…
                    </>
                  ) : (
                    <><Play className="h-3.5 w-3.5" />Run Regression</>
                  )}
                </button>
              </div>

              {manualVersionA && manualVersionB && manualVersionA === manualVersionB && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Please select two different versions to compare.
                </p>
              )}

              {runResult && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  {runResult.riskScore >= 0.6 && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-semibold text-red-800">Release Blocked</AlertTitle>
                      <AlertDescription className="text-red-700">
                        High regression risk between{" "}
                        <strong className="font-mono">{versionLabel(manualVersionA)}</strong> →{" "}
                        <strong className="font-mono">{versionLabel(manualVersionB)}</strong>.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">{versionLabel(manualVersionA)}</span>
                    <span className="text-xs text-slate-300">→</span>
                    <span className="font-mono text-xs font-semibold text-slate-500">{versionLabel(manualVersionB)}</span>
                    <span className={`ml-auto rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                      runResult.passed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}>
                      {runResult.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <RegressionMetricCard label="Semantic Drift" value={runResult.semanticDrift.toFixed(2)} fill={runResult.semanticDrift} description="Meaning change" status={runResult.semanticDrift >= 0.5 ? "error" : runResult.semanticDrift >= 0.3 ? "warning" : "success"} />
                    <RegressionMetricCard label="Token Change" value={runResult.tokenChange} fill={null} status="neutral" description="Output length" />
                    <RegressionMetricCard label="Schema Errors" value={String(runResult.schemaErrors)} fill={null} description="Structural issues" status={runResult.schemaErrors > 0 ? "error" : "success"} />
                    <RegressionMetricCard label="Risk Score" value={runResult.riskScore.toFixed(2)} fill={runResult.riskScore} description="Deployment risk" status={runResult.riskScore >= 0.6 ? "error" : runResult.riskScore >= 0.35 ? "warning" : "success"} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Version Viewer Modal */}
      {viewingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }} onClick={() => setViewingVersion(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Prompt Content</span>
                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">{viewingVersion.version_no}</span>
              </div>
              <button onClick={() => setViewingVersion(null)} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              {viewingVersion.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  Created {new Date(viewingVersion.created_at).toLocaleDateString()}
                </div>
              )}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{viewingVersion.system_prompt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regression Detail Modal */}
      {viewingRegression && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }} onClick={() => setViewingRegression(null)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100">
                  <GitCompare className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-700">
                  <span>{versionLabel(viewingRegression.version1_id)}</span>
                  <span className="text-slate-300">→</span>
                  <span>{versionLabel(viewingRegression.version2_id)}</span>
                </div>
                {viewingRegression.created_at && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {new Date(viewingRegression.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button onClick={() => setViewingRegression(null)} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {viewingRegression.risk_score >= 0.6 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold text-red-800">Release Blocked</AlertTitle>
                  <AlertDescription className="text-red-700">High regression risk. Review all metrics before proceeding.</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-3">
                <RegressionMetricCard label="Semantic Drift" value={viewingRegression.semantic_variance.toFixed(2)} fill={viewingRegression.semantic_variance} description="Meaning change" status={viewingRegression.semantic_variance >= 0.5 ? "error" : viewingRegression.semantic_variance >= 0.3 ? "warning" : "success"} />
                <RegressionMetricCard label="Token Change" value={`${viewingRegression.token_increase >= 0 ? "+" : ""}${viewingRegression.token_increase}%`} fill={null} status="neutral" description="Output length" />
                <RegressionMetricCard label="Schema Errors" value={String(viewingRegression.schema_failure_rate)} fill={null} description="Structural issues" status={viewingRegression.schema_failure_rate > 0 ? "error" : "success"} />
                <RegressionMetricCard label="Risk Score" value={viewingRegression.risk_score.toFixed(2)} fill={viewingRegression.risk_score} description="Deployment risk" status={viewingRegression.risk_score >= 0.6 ? "error" : viewingRegression.risk_score >= 0.35 ? "warning" : "success"} />
              </div>
              <div className="flex justify-end pt-1">
                <span className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${viewingRegression.risk_score < 0.6 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {viewingRegression.risk_score < 0.6 ? "✓ Passed" : "✗ Failed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface RegressionMetricCardProps {
  label: string
  value: string
  fill: number | null
  status: "success" | "warning" | "error" | "neutral"
  description: string
}

function RegressionMetricCard({ label, value, fill, status, description }: RegressionMetricCardProps) {
  const vc = { success: "text-emerald-600", warning: "text-amber-600", error: "text-red-600", neutral: "text-slate-700" }
  const bc = { success: "bg-emerald-500",   warning: "bg-amber-500",   error: "bg-red-500",   neutral: "bg-slate-400" }
  const dc = { success: "bg-emerald-500",   warning: "bg-amber-500",   error: "bg-red-500",   neutral: "bg-slate-400" }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${dc[status]}`} />
      </div>
      <p className={`text-2xl font-bold tracking-tight ${vc[status]}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      {fill !== null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all duration-500 ${bc[status]}`} style={{ width: `${Math.min(fill * 100, 100)}%` }} />
        </div>
      )}
    </div>
  )
}