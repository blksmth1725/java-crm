import { LEAD_STATUS_LABELS, LEAD_STATUS_PIPELINE_ORDER } from "@/lib/lead-status"
import type { LeadStatus, PipelineStatsResponse } from "@/lib/types"

export type PipelineChartRow = {
  status: LeadStatus
  label: string
  count: number
}

export function parseLeadsByStatus(
  raw: PipelineStatsResponse["leadsByStatus"]
): Record<string, number> {
  if (raw == null) {
    return {}
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, number>
      }
    } catch {
      return {}
    }
    return {}
  }
  return raw
}

export function chartRowsFromStats(stats: PipelineStatsResponse | undefined): PipelineChartRow[] {
  if (!stats) {
    return []
  }
  const map = parseLeadsByStatus(stats.leadsByStatus)
  return LEAD_STATUS_PIPELINE_ORDER.map((status) => {
    const raw = map[status]
    const count = typeof raw === "number" ? raw : Number(raw ?? 0)
    return {
      status,
      label: LEAD_STATUS_LABELS[status],
      count: Number.isFinite(count) ? count : 0,
    }
  })
}
