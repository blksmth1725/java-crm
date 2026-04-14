"use client"

import { Fragment } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineChartRow } from "@/lib/stats-chart"

function activeStageIndex(rows: PipelineChartRow[]): number | null {
  const max = Math.max(0, ...rows.map((r) => r.count))
  if (max === 0) {
    return null
  }
  const idx = rows.findIndex((r) => r.count === max)
  return idx >= 0 ? idx : null
}

export function PipelineStageCards({
  rows,
  loading,
}: {
  rows: PipelineChartRow[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex w-full items-stretch gap-1 overflow-x-auto pb-1 md:gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div className="flex shrink-0 items-center self-center text-muted-foreground" aria-hidden>
                <ChevronRight className="size-3.5 md:size-4" strokeWidth={1.5} />
              </div>
            )}
            <div className="h-[118px] min-w-[72px] shrink-0 flex-1 rounded-lg border border-border bg-card md:min-w-0">
              <div className="h-full animate-pulse rounded-lg bg-muted/60" />
            </div>
          </Fragment>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No pipeline data yet.</p>
  }

  const maxCount = Math.max(0, ...rows.map((r) => r.count))
  const activeIdx = activeStageIndex(rows)

  return (
    <div className="-mx-1 flex w-full min-w-0 items-stretch overflow-x-auto px-1 pb-1 md:mx-0 md:overflow-visible md:px-0">
      {rows.map((row, i) => {
        const active = activeIdx === i
        const fillPct = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0
        const displayLabel = row.label.toUpperCase()

        return (
          <Fragment key={row.status}>
            {i > 0 && (
              <div className="flex shrink-0 items-center self-center text-muted-foreground" aria-hidden>
                <ChevronRight className="size-3.5 md:size-4" strokeWidth={1.5} />
              </div>
            )}
            <div
              className={cn(
                "flex min-w-[72px] shrink-0 flex-col rounded-lg border border-border bg-card px-2 py-2.5 md:min-w-0 md:flex-1 md:px-3 md:py-3",
                active && "border-primary/60 shadow-sm ring-1 ring-primary/20"
              )}
            >
              <div className="min-h-[2.25rem] text-center text-[7px] font-medium uppercase leading-snug tracking-wide text-muted-foreground sm:text-[8px] md:min-h-0 md:text-[9px] md:leading-tight md:tracking-wider">
                {displayLabel}
              </div>
              <div className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 py-1 md:min-h-[56px]">
                <span
                  className={cn(
                    "text-xl font-semibold tabular-nums md:text-2xl",
                    row.count > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {row.count > 0 ? row.count : "—"}
                </span>
                {active && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary md:text-[10px]">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-muted md:h-2">
                <div
                  className="h-full min-w-0 rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
