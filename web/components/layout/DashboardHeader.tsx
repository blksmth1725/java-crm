"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/leads")) return "Leads"
  if (pathname.startsWith("/clients")) return "Clients"
  if (pathname.startsWith("/tasks")) return "Tasks"
  return "Dashboard"
}

export function DashboardHeader() {
  const pathname = usePathname()
  return <Header title={titleForPath(pathname)} />
}
