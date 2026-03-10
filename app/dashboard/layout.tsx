import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Subtle dot-grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <AppSidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <AppHeader />

        <main className="flex-1 overflow-y-auto">
          {/* Top fade from header */}
          <div className="sticky top-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-60" />

          <div className="px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}