// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const fetchUserPrompts = async (username: string) => {
    const res = await fetch(`${API_BASE_URL}/users/${username}/prompts`);
    if (!res.ok) throw new Error("Failed to fetch prompts");
    return res.json();
};

export const fetchPromptDetails = async (promptId: string) => {
    const res = await fetch(`${API_BASE_URL}/prompts/${promptId}`);
    if (!res.ok) throw new Error("Failed to fetch prompt details");
    return res.json();
};