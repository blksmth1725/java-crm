"use client"

import { useJwtAgent } from "@/hooks/use-agent-jwt"

export function Header({ title }: { title: string }) {
  const jwt = useJwtAgent()
  const display =
    jwt?.firstName && jwt?.role
      ? `${jwt.firstName} · ${jwt.role}`
      : jwt?.sub
        ? `${jwt.sub} · ${jwt?.role ?? ""}`
        : "—"

  return (
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
      <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="max-w-[55%] truncate text-right text-xs text-muted-foreground sm:text-sm">
        {display}
      </p>
    </header>
  )
}
