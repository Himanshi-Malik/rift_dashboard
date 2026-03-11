"use client"

import { useState } from "react"
import { SafetyPipeline } from "@/components/dashboard/safety-pipeline"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PromptRegistry, type Prompt } from "@/components/dashboard/prompt-registry"
import { VersionHistory } from "@/components/dashboard/version-history"
import { Activity, LayoutGrid, BookOpen, GitBranch } from "lucide-react"

export default function DashboardPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

  return (
    <div className="space-y-8">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor your prompt pipeline health and registry.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-slate-600">Live · Last 24 hours</span>
        </div>
      </div>

      {/* ── Pipeline Section ── */}
      <section>
        <SectionLabel icon={<Activity className="h-3.5 w-3.5" />} label="Safety Pipeline" />
        <SafetyPipeline />
      </section>

      {/* ── Metrics Section ── */}
      <section>
        <SectionLabel icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Overview" />
        <MetricsCards />
      </section>

      {/* ── Registry Section ── */}
      <section>
        <SectionLabel icon={<BookOpen className="h-3.5 w-3.5" />} label="Prompt Registry" />
        <PromptRegistry selectedPrompt={selectedPrompt} onSelectPrompt={setSelectedPrompt} />
      </section>

      {/* ── Version History (shown on row click) ── */}
      {selectedPrompt && (
        <section>
          <SectionLabel
            icon={<GitBranch className="h-3.5 w-3.5" />}
            label="Version History"
            suffix={
              <span className="ml-2 font-mono text-slate-600">{selectedPrompt.name}</span>
            }
          />
          <VersionHistory prompt={selectedPrompt} />
        </section>
      )}
    </div>
  )
}

// ── Section Label ──────────────────────────────────────────────────────────────

function SectionLabel({
  icon, label, suffix,
}: {
  icon: React.ReactNode
  label: string
  suffix?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex items-center justify-center text-indigo-500">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {suffix}
      <div className="ml-2 flex-1 border-t border-dashed border-slate-200" />
    </div>
  )
}