import { AuthGuard } from "@/components/auth/AuthGuard"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30 pb-16 md:pb-0">
        <Sidebar />
        <div className="flex min-h-screen flex-col pt-14 md:ml-[240px] md:pt-0">
          <DashboardHeader />
          <main className="flex-1 overflow-x-auto p-4">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
