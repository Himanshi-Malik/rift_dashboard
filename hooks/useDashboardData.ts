// src/hooks/useDashboardData.ts

import { useState, useEffect } from "react"
import { fetchUserPrompts, fetchPromptDetails } from "../lib/api"

export type DashboardRow = {
  id: string
  name: string
  stable_version: string
  candidate_version: string
  status: "Stable" | "Testing" | "Failed"
  risk_delta: string
  risk_score: number
}

export function useDashboardData(username: string) {
  const [dashboardData, setDashboardData] = useState<DashboardRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const prompts = await fetchUserPrompts(username)

        const detailedResults = await Promise.all(
          prompts.map((p) => fetchPromptDetails(p.id))
        )

        const rows: DashboardRow[] = detailedResults.map((detail) => {
          const prompt      = detail.prompt as any   // has stable_version_id, candidate_version_id
          const versions    = detail.versions ?? []
          const regressions = detail.regressions ?? []

          const stableVersion    = versions.find((v: any) => v.id === prompt.stable_version_id)
          const candidateVersion = versions.find((v: any) => v.id === prompt.candidate_version_id)

          const latestRegression = regressions.length > 0
            ? regressions[regressions.length - 1]
            : null

          // ✅ Testing only if candidate actually exists
          let status: DashboardRow["status"] = "Stable"
          if (candidateVersion) {
            if (latestRegression && latestRegression.risk_score > 0.6) status = "Failed"
            else status = "Testing"
          }

          return {
            id:                prompt.id,
            name:              prompt.name,
            stable_version:    stableVersion?.version_no    ?? "v1.0",
            candidate_version: candidateVersion?.version_no ?? "-",
            status,
            risk_delta: latestRegression
              ? `+${(latestRegression.risk_score * 100).toFixed(0)}%`
              : "No change",
            risk_score: latestRegression?.risk_score ?? 0,
          }
        })

        setDashboardData(rows)
      } catch (err) {
        console.error("Error loading dashboard:", err)
        setError("Could not load prompts. Is the backend running?")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [username])

  return { dashboardData, isLoading, error }
}