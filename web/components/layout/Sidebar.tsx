"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { clearToken } from "@/lib/auth-token"
import { useJwtAgent } from "@/hooks/use-agent-jwt"

const workspace = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UserPlus },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
] as const

function navActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function userDisplayName(jwt: ReturnType<typeof useJwtAgent>): string {
  if (!jwt) return "Agent"
  if (jwt.firstName?.trim()) return jwt.firstName.trim()
  const local = jwt.sub?.split("@")[0]
  return local?.trim() || "Agent"
}

function userInitials(jwt: ReturnType<typeof useJwtAgent>): string {
  if (!jwt) return "?"
  if (jwt.firstName?.trim()) {
    const parts = jwt.firstName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase() || "?"
    }
    return jwt.firstName.trim().slice(0, 2).toUpperCase()
  }
  return jwt.sub?.slice(0, 2).toUpperCase() ?? "?"
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const jwt = useJwtAgent()

  function logout() {
    clearToken()
    router.replace("/login")
  }

  return (
    <>
      <aside className="fixed inset-x-0 top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800/80 bg-zinc-950 px-3 md:inset-x-auto md:top-0 md:left-0 md:h-screen md:w-[260px] md:flex-col md:items-stretch md:gap-0 md:overflow-x-visible md:border-r md:border-b-0 md:px-0 md:py-0">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 px-1 py-2 md:px-5 md:pb-2 md:pt-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-heading text-sm font-semibold tracking-tight text-primary">Agent CRM</div>
            <div className="hidden text-[11px] text-zinc-500 md:block">Workspace</div>
          </div>
        </div>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:items-stretch md:overflow-y-auto md:px-3 md:pb-4">
          <p className="mb-2 hidden px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 md:block">
            Main
          </p>
          {workspace.map(({ href, label, icon: Icon }) => {
            const active = navActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors md:gap-3 md:px-3 md:py-2.5 md:text-[0.8125rem]",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/90 hover:text-zinc-100"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 md:size-[18px]",
                    active ? "text-primary-foreground" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="hidden shrink-0 border-t border-zinc-800/80 p-3 md:block">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary"
              aria-hidden
            >
              {userInitials(jwt)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-zinc-100">{userDisplayName(jwt)}</div>
              <div className="truncate text-xs text-zinc-500">{jwt?.role ?? "—"}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-primary hover:bg-zinc-800 hover:text-primary"
              onClick={logout}
              aria-label="Log out"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-zinc-950 p-2 md:hidden">
        <Button type="button" variant="outline" size="sm" className="w-full bg-zinc-900" onClick={logout}>
          Log out
        </Button>
      </div>
    </>
  )
}
