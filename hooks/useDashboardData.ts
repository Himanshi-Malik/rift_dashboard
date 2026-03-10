// hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import { fetchUserPrompts, fetchPromptDetails } from "../lib/api";

export function useDashboardData(username: string) {
    const [dashboardData, setDashboardData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get all base prompts for the user
                const prompts = await fetchUserPrompts(username);
                
                // 2. Fetch the deep details (versions & regressions) for every prompt
                const detailedPromises = prompts.map((p: any) => fetchPromptDetails(p.id));
                const detailedResults = await Promise.all(detailedPromises);

                // 3. Format the data perfectly for your Prompt Registry table
                const formattedTableData = detailedResults.map((detail: any) => {
                    const prompt = detail.prompt;
                    const versions = detail.versions || [];
                    const regressions = detail.regressions || [];

                    // Grab the latest regression test to show on the dashboard
                    const latestRegression = regressions.length > 0 ? regressions[regressions.length - 1] : null;

                    return {
                        id: prompt.id,
                        name: prompt.name,
                        stable_version: versions.length > 0 ? versions[0].version_no : "v1.0",
                        candidate_version: versions.length > 1 ? versions[versions.length - 1].version_no : "-",
                        status: latestRegression ? (latestRegression.risk_score > 0.5 ? "Failed" : "Testing") : "Stable",
                        risk_delta: latestRegression ? `+${(latestRegression.risk_score * 100).toFixed(0)}%` : "No change",
                    };
                });

                setDashboardData(formattedTableData);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [username]);

    return { dashboardData, isLoading };
}