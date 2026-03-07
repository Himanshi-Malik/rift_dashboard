import { GitBranch, CheckCircle2, Clock, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prompt } from "./prompt-registry"

interface Version {
  version: string
  status: "candidate" | "stable" | "rolled-back"
  date: string
  author: string
}

const versionHistory: Record<string, Version[]> = {
  support_bot: [
    { version: "v1.5", status: "candidate", date: "Mar 1", author: "jdoe" },
    { version: "v1.4", status: "stable", date: "Feb 26", author: "asmith" },
    { version: "v1.3", status: "rolled-back", date: "Feb 20", author: "jdoe" },
  ],
  summarizer: [
    { version: "v2.1", status: "stable", date: "Feb 28", author: "mchen" },
    { version: "v2.0", status: "rolled-back", date: "Feb 15", author: "mchen" },
  ],
  faq_assistant: [
    { version: "v3.1", status: "candidate", date: "Mar 2", author: "asmith" },
    { version: "v3.0", status: "stable", date: "Feb 22", author: "jdoe" },
  ],
  code_reviewer: [
    { version: "v1.3", status: "candidate", date: "Mar 3", author: "mchen" },
    { version: "v1.2", status: "stable", date: "Feb 25", author: "asmith" },
  ],
  email_drafter: [
    { version: "v2.0", status: "stable", date: "Feb 20", author: "jdoe" },
    { version: "v1.9", status: "rolled-back", date: "Feb 12", author: "jdoe" },
  ],
}

const statusConfig = {
  candidate: { label: "Candidate", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200", iconClass: "text-amber-500" },
  stable: { label: "Stable", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200", iconClass: "text-emerald-500" },
  "rolled-back": { label: "Rolled back", icon: RotateCcw, className: "bg-slate-50 text-slate-500 border-slate-200", iconClass: "text-slate-400" },
}

interface VersionHistoryProps {
  prompt: Prompt
}

export function VersionHistory({ prompt }: VersionHistoryProps) {
  const versions = versionHistory[prompt.name] || []

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <GitBranch className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Version History</span>
      </div>
      <div className="divide-y divide-slate-100">
        {versions.map((version, index) => {
          const status = statusConfig[version.status]
          const StatusIcon = status.icon
          const isLatest = index === 0

          return (
            <div
              key={version.version}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                isLatest && "bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    version.status === "stable" ? "border-emerald-500 bg-emerald-50" :
                    version.status === "candidate" ? "border-amber-500 bg-amber-50" :
                    "border-slate-300 bg-slate-50"
                  )}>
                    <StatusIcon className={cn("h-4 w-4", status.iconClass)} />
                  </div>
                  {index < versions.length - 1 && (
                    <div className="absolute left-1/2 top-8 h-6 w-0.5 -translate-x-1/2 bg-slate-200" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">{version.version}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", status.className)}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">by {version.author}</span>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500">{version.date}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
