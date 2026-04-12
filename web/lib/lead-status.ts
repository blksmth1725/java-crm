import type { LeadStatus } from "@/lib/types"

export const LEAD_STATUS_PIPELINE_ORDER: readonly LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const

export const LEAD_STATUS_VALUES: LeadStatus[] = [...LEAD_STATUS_PIPELINE_ORDER]

const statusRank: Record<LeadStatus, number> = Object.fromEntries(
  LEAD_STATUS_PIPELINE_ORDER.map((s, i) => [s, i])
) as Record<LeadStatus, number>

export function compareLeadStatusPipeline(a: LeadStatus, b: LeadStatus): number {
  return statusRank[a] - statusRank[b]
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal sent",
  NEGOTIATING: "Negotiating",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
}
