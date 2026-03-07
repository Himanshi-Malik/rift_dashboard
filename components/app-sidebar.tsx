"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FlaskConical, FileText, Settings, HelpCircle } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Regression", href: "/dashboard/regression", icon: FlaskConical },
  { name: "Prompts", href: "/dashboard/prompts", icon: FileText },
]

const secondaryNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Docs", href: "/dashboard/docs", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-52 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-12 items-center gap-2 border-b border-slate-200 px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">
          R
        </div>
        <span className="text-sm font-semibold text-slate-900">RIFT</span>
        <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">v0.4</span>
      </div>
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="border-t border-slate-200 px-2 py-2">
        {secondaryNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  )
}
