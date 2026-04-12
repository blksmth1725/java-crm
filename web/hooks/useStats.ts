"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyStats } from "@/lib/api/stats"

export function useMyStats() {
  return useQuery({
    queryKey: ["stats", "me"],
    queryFn: getMyStats,
  })
}
