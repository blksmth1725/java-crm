"use client"

import { useMemo, useState } from "react"
import { PipelineStageCards } from "@/components/dashboard/PipelineStageCards"
import { TaskEditDrawer } from "@/components/tasks/TaskEditDrawer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { chartRowsFromStats, parseLeadsByStatus } from "@/lib/stats-chart"
import { useJwtAgent } from "@/hooks/use-agent-jwt"
import { useMyStats } from "@/hooks/useStats"
import { useTasksByAgent } from "@/hooks/useTasks"
import type { Task } from "@/lib/types"

export default function DashboardPage() {
  const jwt = useJwtAgent()
  const agentId = jwt?.agentId ?? null
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const { data: stats, isLoading: statsLoading, error: statsError } = useMyStats()
  const { data: tasks, isLoading: tasksLoading } = useTasksByAgent(agentId)

  const pipelineRows = useMemo(() => chartRowsFromStats(stats), [stats])

  const closedWon = stats ? parseLeadsByStatus(stats.leadsByStatus)["CLOSED_WON"] ?? 0 : 0

  const recentTasks = useMemo(() => {
    const list = tasks ?? []
    return list
      .filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
  }, [tasks])

  if (statsError) {
    return <p className="text-sm text-destructive">{statsError.message}</p>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{stats?.totalLeads ?? 0}</p>
                <CardDescription>All pipeline stages</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{stats?.totalClients ?? 0}</p>
                <CardDescription>Converted relationships</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {stats?.totalPendingTasks ?? 0}
                </p>
                <CardDescription>In progress or waiting</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Closed won
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{closedWon}</p>
                <CardDescription>Won opportunities</CardDescription>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-card">
          <CardTitle className="text-base">Pipeline by status</CardTitle>
          <CardDescription>Lead volume per stage</CardDescription>
        </CardHeader>
        <CardContent className="px-3 py-4 md:px-4">
          <PipelineStageCards rows={pipelineRows} loading={statsLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming tasks</CardTitle>
          <CardDescription>Next five pending or in-progress items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasksLoading && <Skeleton className="h-20 w-full" />}
          {!tasksLoading && recentTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No open tasks.</p>
          )}
          {recentTasks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTaskToEdit(t)}
              className="flex w-full min-w-0 cursor-pointer flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0 truncate font-medium">{t.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {t.dueDate} · {t.status}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <TaskEditDrawer task={taskToEdit} onClose={() => setTaskToEdit(null)} />
    </div>
  )
}
