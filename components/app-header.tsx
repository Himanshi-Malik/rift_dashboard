"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, ChevronDown, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const environments = [
  { id: "dev", label: "Development", color: "text-amber-500" },
  { id: "staging", label: "Staging", color: "text-blue-500" },
  { id: "prod", label: "Production", color: "text-green-500" },
]

export function AppHeader() {
  const router = useRouter()
  const [environment, setEnvironment] = useState("dev")
  const currentEnv = environments.find((e) => e.id === environment)

  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[13px] font-medium text-slate-700">
              <Circle className={cn("h-2 w-2 fill-current", currentEnv?.color)} />
              {currentEnv?.label}
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {environments.map((env) => (
              <DropdownMenuItem
                key={env.id}
                onClick={() => setEnvironment(env.id)}
                className={cn("gap-2 text-[13px]", environment === env.id && "bg-slate-50")}
              >
                <Circle className={cn("h-2 w-2 fill-current", env.color)} />
                {env.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-slate-300">|</span>
        <span className="text-[13px] text-slate-500">acme-corp</span>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-slate-200 text-[10px] font-medium text-slate-600">JD</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <div className="px-2 py-1.5">
              <p className="text-[13px] font-medium text-slate-900">John Doe</p>
              <p className="text-[12px] text-slate-500">john@acme.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/login")} className="gap-2 text-[13px] text-red-600">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
