"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, MessageSquare, Bot, BarChart3 } from "lucide-react"

export default function RegressionPage() {
  const riskScore = 0.71
  const isHighRisk = riskScore > 0.6

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Regression Testing</h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare outputs of stable and candidate prompts
        </p>
      </div>

      {isHighRisk && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Release Blocked</AlertTitle>
          <AlertDescription className="text-red-700">
            Release blocked due to high regression risk. Review the metrics below before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Input Query Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MessageSquare className="h-5 w-5 text-slate-500" />
            Test Input Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              User asks refund for expired product.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Output Comparison Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Bot className="h-5 w-5 text-green-600" />
              Stable Prompt Output
              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                v1.4
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-slate-700">
                Sorry, refunds cannot be issued after expiry. Our policy states that all refund 
                requests must be made within 30 days of purchase. I understand this may be 
                frustrating, but I&apos;m unable to process this request.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Bot className="h-5 w-5 text-amber-600" />
              Candidate Prompt Output
              <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">
                v1.5
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-slate-700">
                You may still be eligible for a refund. While our standard policy is 30 days, 
                I can see if we can make an exception in your case. Let me check with my 
                supervisor and get back to you shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Panel */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            Evaluation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricItem
              label="Semantic Drift"
              value="0.63"
              status="warning"
              description="Measures how much meaning has changed"
            />
            <MetricItem
              label="Token Change"
              value="+12%"
              status="neutral"
              description="Change in output length"
            />
            <MetricItem
              label="Schema Errors"
              value="3"
              status="error"
              description="Structural inconsistencies detected"
            />
            <MetricItem
              label="Risk Score"
              value="0.71"
              status="error"
              description="Overall deployment risk"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Test Cases */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Test Suite Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TestCaseResult
              name="Refund request - expired product"
              passed={false}
              drift={0.63}
            />
            <TestCaseResult
              name="Refund request - valid timeframe"
              passed={true}
              drift={0.12}
            />
            <TestCaseResult
              name="Product inquiry - pricing"
              passed={true}
              drift={0.08}
            />
            <TestCaseResult
              name="Complaint handling - shipping delay"
              passed={false}
              drift={0.45}
            />
            <TestCaseResult
              name="General FAQ - store hours"
              passed={true}
              drift={0.03}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricItemProps {
  label: string
  value: string
  status: "success" | "warning" | "error" | "neutral"
  description: string
}

function MetricItem({ label, value, status, description }: MetricItemProps) {
  const statusColors = {
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
    neutral: "text-slate-600",
  }

  const indicatorColors = {
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-slate-400",
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`h-2 w-2 rounded-full ${indicatorColors[status]}`} />
      </div>
      <p className={`text-2xl font-semibold ${statusColors[status]}`}>{value}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}

interface TestCaseResultProps {
  name: string
  passed: boolean
  drift: number
}

function TestCaseResult({ name, passed, drift }: TestCaseResultProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
            passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {passed ? "✓" : "✗"}
        </span>
        <span className="text-sm font-medium text-slate-700">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Drift: <span className="font-mono">{drift.toFixed(2)}</span>
        </span>
        <Badge
          variant="outline"
          className={
            passed
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {passed ? "Passed" : "Failed"}
        </Badge>
      </div>
    </div>
  )
}
