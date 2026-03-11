// src/lib/api.ts
// ─── Central API client — import everything from here ────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── Types (mirror your Python models exactly) ────────────────────────────────

export type Prompt = {
  id: string
  name: string
  user_id: string
  created_at?: string
}

export type PromptVersion = {
  id: string
  prompt_id: string
  version_no: string
  system_prompt: string
  prompt_template: string
  output_schema: string
  created_at?: string
}

export type PromptRegression = {
  id: string
  prompt_id: string
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

export type PromptDetail = {
  prompt: Prompt
  versions: PromptVersion[]
  regressions: PromptRegression[]
}

// ─── GET requests ─────────────────────────────────────────────────────────────

export async function fetchUserPrompts(username: string): Promise<Prompt[]> {
  const res = await fetch(`${BASE}/api/users/${username}/prompts`)
  if (!res.ok) throw new Error(`fetchUserPrompts failed: ${res.status}`)
  return res.json()
}

export async function fetchPromptDetails(promptId: string): Promise<PromptDetail> {
  const res = await fetch(`${BASE}/api/prompts/${promptId}`)
  if (!res.ok) throw new Error(`fetchPromptDetails failed: ${res.status}`)
  return res.json()
}

export async function fetchPromptVersions(promptId: string): Promise<PromptVersion[]> {
  const res = await fetch(`${BASE}/api/prompts/${promptId}/versions`)
  if (!res.ok) throw new Error(`fetchPromptVersions failed: ${res.status}`)
  return res.json()
}

export async function fetchPromptRegressions(promptId: string): Promise<PromptRegression[]> {
  const res = await fetch(`${BASE}/api/prompts/${promptId}/regressions`)
  if (!res.ok) throw new Error(`fetchPromptRegressions failed: ${res.status}`)
  return res.json()
}

// ─── POST requests ────────────────────────────────────────────────────────────

export async function createUser(name: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${BASE}/api/users?name=${encodeURIComponent(name)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error(`createUser failed: ${res.status}`)
  return res.json()
}

export async function createPrompt(data: {
  name: string
  user_id: string
}): Promise<Prompt> {
  const res = await fetch(`${BASE}/api/prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createPrompt failed: ${res.status}`)
  return res.json()
}

export async function createVersion(
  promptId: string,
  data: {
    version_no: string
    system_prompt: string
    prompt_template: string
    output_schema: string
  }
): Promise<PromptVersion> {
  const res = await fetch(`${BASE}/api/prompts/${promptId}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createVersion failed: ${res.status}`)
  return res.json()
}

export async function createRegression(
  promptId: string,
  data: {
    version1_id: string
    version2_id: string
    token_increase: number
    semantic_variance: number
    schema_failure_rate: number
    response_variance: number
    length_delta: number
    risk_score: number
  }
): Promise<PromptRegression> {
  const res = await fetch(`${BASE}/api/prompts/${promptId}/regressions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createRegression failed: ${res.status}`)
  return res.json()
}