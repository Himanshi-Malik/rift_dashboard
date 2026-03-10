"use client"

import { useState } from "react"
import { SafetyPipeline } from "@/components/dashboard/safety-pipeline"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { PromptRegistry, type Prompt } from "@/components/dashboard/prompt-registry"
import { VersionHistory } from "@/components/dashboard/version-history"
import { Key } from "lucide-react"
import { error } from "console"
// import { DiffViewer } from "@/components/dashboard/diff-viewer"
async function getPromptsforUser(){
  const user=JSON.parse(localStorage.getItem("loggedInUser") || "[]");
  if(!user) console.log(error); 

  const response =await fetch(`http://127.0.0.1:8000/users/${user.name}/prompts`)
  const prompts=response.json();

  localStorage.setItem("UserPrompts",JSON.stringify(prompts))

}
export default function DashboardPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  return (
    <div className="space-y-6">
      {/* Pipeline Section */}
      <section>
        <SafetyPipeline />
      </section>

      {/* Metrics Section */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</h3>
        </div>
        <MetricsCards />
      </section>

      {/* Registry Section */}
      <section>
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prompt Registry</h3>
        </div>
        <PromptRegistry selectedPrompt={selectedPrompt} onSelectPrompt={setSelectedPrompt} />
      </section>

      {/* Detail Section */}
      {selectedPrompt && (
        <section>
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Details: <span className="font-mono text-slate-700">{selectedPrompt.name}</span>
            </h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <VersionHistory prompt={selectedPrompt} />
            {/* <DiffViewer prompt={selectedPrompt} /> */}
          </div>
        </section>
      )}
    </div>
  )
}
