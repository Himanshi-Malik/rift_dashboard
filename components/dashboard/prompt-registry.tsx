"use client"

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Prompt {
  id: string
  name: string
  stableVersion: string
  candidateVersion: string | null
  status: "stable" | "testing" | "failed"
  lastUpdated: string
  riskDelta?: number
}
//need to do api call here to get prompts for the user and set in local storage and then use that data to display in the table.
const prompts: Prompt[] = [
  { id: "1", name: "support_bot", stableVersion: "v1.4", candidateVersion: "v1.5", status: "testing", lastUpdated: "2h ago", riskDelta: 53 },
  { id: "2", name: "summarizer", stableVersion: "v2.1", candidateVersion: null, status: "stable", lastUpdated: "3d ago" },
  { id: "3", name: "faq_assistant", stableVersion: "v3.0", candidateVersion: "v3.1", status: "failed", lastUpdated: "1h ago", riskDelta: 23 },
  { id: "4", name: "code_reviewer", stableVersion: "v1.2", candidateVersion: "v1.3", status: "testing", lastUpdated: "5h ago", riskDelta: 8 },
  { id: "5", name: "email_drafter", stableVersion: "v2.0", candidateVersion: null, status: "stable", lastUpdated: "1w ago" },
]

const statusConfig = {
  stable: { label: "Stable", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200", iconClass: "text-emerald-500" },
  testing: { label: "Testing", icon: AlertTriangle, className: "bg-amber-50 text-amber-700 border-amber-200", iconClass: "text-amber-500" },
  failed: { label: "Failed", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200", iconClass: "text-red-500" },
}

function RiskIndicator({ delta }: { delta: number }) {
  const level = delta > 40 ? "high" : delta > 15 ? "medium" : "low"
  const config = {
    high: { bg: "bg-red-500", text: "text-red-700", label: "High" },
    medium: { bg: "bg-amber-500", text: "text-amber-700", label: "Med" },
    low: { bg: "bg-emerald-500", text: "text-emerald-700", label: "Low" },
  }
  const c = config[level]

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-12 items-center overflow-hidden rounded-sm bg-slate-100">
        <div className={cn("h-full", c.bg)} style={{ width: `${Math.min(delta, 100)}%` }} />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums", c.text)}>+{delta}%</span>
    </div>
  )
}

interface PromptRegistryProps {
  selectedPrompt: Prompt | null
  onSelectPrompt: (prompt: Prompt) => void
}

export function PromptRegistry({ selectedPrompt, onSelectPrompt }: PromptRegistryProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Prompt</th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Stable</th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Candidate</th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {prompts.map((prompt) => {
            const status = statusConfig[prompt.status]
            const StatusIcon = status.icon
            return (
              <tr
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={cn(
                  "cursor-pointer border-b border-slate-100 transition-colors last:border-0",
                  selectedPrompt?.id === prompt.id
                    ? "bg-blue-50/50"
                    : "hover:bg-slate-50/50"
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-mono font-medium text-slate-900">{prompt.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{prompt.stableVersion}</span>
                </td>
                <td className="px-4 py-3">
                  {prompt.candidateVersion ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-700">{prompt.candidateVersion}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", status.className)}>
                    <StatusIcon className={cn("h-3 w-3", status.iconClass)} />
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
