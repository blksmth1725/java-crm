"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { getToken } from "@/lib/auth-token"
import { decodeToken, type JwtPayload } from "@/lib/jwt"

export function useJwtAgent(): JwtPayload | null {
  const pathname = usePathname()
  return useMemo(() => {
    const token = getToken()
    if (!token) {
      return null
    }
    try {
      return decodeToken(token)
    } catch {
      return null
    }
  }, [pathname])
}
