import { api } from "@/lib/axios"
import type { PipelineStatsResponse } from "@/lib/types"

export async function getMyStats(): Promise<PipelineStatsResponse> {
  const { data } = await api.get<PipelineStatsResponse>("/api/stats/me")
  return data
}
