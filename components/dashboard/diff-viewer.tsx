"use client"

import { ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prompt } from "./prompt-registry"

interface PromptVersion {
  version: string
  content: string[]
  riskScore: number
}

const promptVersions: Record<string, { stable: PromptVersion; candidate: PromptVersion }> = {
  support_bot: {
    stable: {
      version: "v1.4",
      content: [
        "Be polite and professional in all responses",
        "Issue refunds only if policy allows",
        "Refer complex issues to human support",
        "Always verify customer identity first",
      ],
      riskScore: 15,
    },
    candidate: {
      version: "v1.5",
      content: [
        "Be polite and professional in all responses",
        "Always issue refunds for customer satisfaction",
        "Escalate to manager if customer is unsatisfied",
        "Always verify customer identity first",
      ],
      riskScore: 68,
    },
  },
  summarizer: {
    stable: { version: "v2.1", content: ["Summarize the content concisely", "Limit summary to 100 words", "Preserve key facts and figures"], riskScore: 8 },
    candidate: { version: "v2.2", content: ["Summarize the content concisely", "Include key action items at the end", "Limit summary to 150 words", "Preserve key facts and figures"], riskScore: 12 },
  },
  faq_assistant: {
    stable: { version: "v3.0", content: ["Respond with generic answers when unsure", "Always provide source links when available", "Keep responses under 200 words"], riskScore: 22 },
    candidate: { version: "v3.1", content: ["Check knowledge base before responding", "Admit uncertainty and offer to escalate", "Always provide source links when available", "Keep responses under 200 words"], riskScore: 45 },
  },
  code_reviewer: {
    stable: { version: "v1.2", content: ["Review code for best practices", "Focus only on syntax errors", "Provide constructive feedback"], riskScore: 10 },
    candidate: { version: "v1.3", content: ["Review code for best practices", "Check for security vulnerabilities", "Suggest performance improvements", "Provide constructive feedback"], riskScore: 18 },
  },
  email_drafter: {
    stable: { version: "v2.0", content: ["Use casual language", "Keep emails concise and to the point", "Match the tone of previous correspondence"], riskScore: 12 },
    candidate: { version: "v2.1", content: ["Use professional tone for business emails", "Keep emails concise and to the point", "Include clear call-to-action", "Match the tone of previous correspondence"], riskScore: 15 },
  },
}

function RiskScore({ score, label }: { score: number; label: string }) {
  const level = score > 50 ? "high" : score > 25 ? "medium" : "low"
  const config = {
    high: { color: "text-red-600", bg: "bg-red-500", bgLight: "bg-red-100", icon: ShieldAlert },
    medium: { color: "text-amber-600", bg: "bg-amber-500", bgLight: "bg-amber-100", icon: ShieldAlert },
    low: { color: "text-emerald-600", bg: "bg-emerald-500", bgLight: "bg-emerald-100", icon: ShieldCheck },
  }
  const c = config[level]
  const Icon = c.icon

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", c.color)} />
        <span className={cn("text-lg font-bold tabular-nums", c.color)}>{score}</span>
      </div>
      <div className={cn("h-1.5 w-16 overflow-hidden rounded-full", c.bgLight)}>
        <div className={cn("h-full rounded-full", c.bg)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

interface DiffViewerProps {
  prompt: Prompt
}

export function DiffViewer({ prompt }: DiffViewerProps) {
  const versions = promptVersions[prompt.name]
  if (!versions) return null

  const { stable, candidate } = versions
  const delta = candidate.riskScore - stable.riskScore
  const deltaLevel = delta > 30 ? "high" : delta > 15 ? "medium" : "low"
  const deltaConfig = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {/* Risk Comparison Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Risk Assessment</span>
          <div className="flex items-center gap-4">
            <RiskScore score={stable.riskScore} label="Stable" />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <RiskScore score={candidate.riskScore} label="Candidate" />
            <div className={cn("rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums", deltaConfig[deltaLevel])}>
              {delta > 0 ? "+" : ""}{delta} pts
            </div>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2">
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-700">{stable.version}</span>
            <span className="text-xs text-slate-500">stable</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            {stable.content.map((line, i) => {
              const isRemoved = !candidate.content.includes(line)
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded px-2 py-1",
                    isRemoved ? "bg-red-50 text-red-800" : "text-slate-700"
                  )}
                >
                  {isRemoved && <span className="mr-2 font-bold text-red-500">-</span>}
                  <span className={cn(isRemoved && "line-through")}>{line}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2">
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-700">{candidate.version}</span>
            <span className="text-xs text-slate-500">candidate</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            {candidate.content.map((line, i) => {
              const isAdded = !stable.content.includes(line)
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded px-2 py-1",
                    isAdded ? "bg-emerald-50 text-emerald-800" : "text-slate-700"
                  )}
                >
                  {isAdded && <span className="mr-2 font-bold text-emerald-600">+</span>}
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
