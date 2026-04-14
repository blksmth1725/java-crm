import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@/lib/types"
import { LEAD_STATUS_LABELS } from "@/lib/lead-status"

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: LEAD_STATUS_LABELS.NEW,
    className: "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  CONTACTED: {
    label: LEAD_STATUS_LABELS.CONTACTED,
    className:
      "border-primary/35 bg-primary/10 text-primary dark:border-primary/45 dark:bg-primary/15 dark:text-primary",
  },
  QUALIFIED: {
    label: LEAD_STATUS_LABELS.QUALIFIED,
    className: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
  PROPOSAL_SENT: {
    label: LEAD_STATUS_LABELS.PROPOSAL_SENT,
    className: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  NEGOTIATING: {
    label: LEAD_STATUS_LABELS.NEGOTIATING,
    className: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
  },
  CLOSED_WON: {
    label: LEAD_STATUS_LABELS.CLOSED_WON,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  CLOSED_LOST: {
    label: LEAD_STATUS_LABELS.CLOSED_LOST,
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = statusConfig[status]
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
