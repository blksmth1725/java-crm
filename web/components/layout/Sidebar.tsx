"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearToken } from "@/lib/auth-token"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/clients", label: "Clients" },
  { href: "/tasks", label: "Tasks" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    clearToken()
    router.replace("/login")
  }

  return (
    <>
      <aside className="fixed inset-x-0 top-0 z-40 flex h-14 shrink-0 items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-900 px-2 md:inset-x-auto md:top-0 md:left-0 md:h-screen md:w-[240px] md:flex-col md:items-stretch md:overflow-x-visible md:border-r md:border-b-0 md:px-0 md:py-4">
        <div className="flex shrink-0 items-center px-3 py-2 md:mb-4 md:px-4">
          <span className="font-heading text-sm font-semibold tracking-tight text-zinc-100">Agent CRM</span>
        </div>
        <nav className="flex min-w-0 flex-1 items-center gap-1 md:flex-col md:items-stretch md:px-2">
          {links.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-2 text-xs font-medium not-italic transition-colors md:px-3 md:text-[0.8125rem]",
                  active
                    ? "border-l-2 border-indigo-400 bg-zinc-800/80 text-zinc-50 md:border-l-4"
                    : "border-l-2 border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="hidden shrink-0 px-2 pb-2 md:mt-auto md:block">
          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </aside>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-900 p-2 md:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-zinc-700 bg-transparent text-zinc-300"
          onClick={logout}
        >
          Log out
        </Button>
      </div>
    </>
  )
}
