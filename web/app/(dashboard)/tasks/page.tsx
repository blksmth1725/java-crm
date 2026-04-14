"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/errors"
import type { Task, TaskStatus } from "@/lib/types"
import { useJwtAgent } from "@/hooks/use-agent-jwt"
import { useTasksByAgent, useUpdateTask } from "@/hooks/useTasks"

const statuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

function dueMeta(task: Task) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const parts = task.dueDate.split("-").map(Number)
  const due = new Date(parts[0], parts[1] - 1, parts[2])
  due.setHours(0, 0, 0, 0)
  const isOverdue = due < today && task.status !== "COMPLETED"
  const isDueToday = due.getTime() === today.getTime()
  let className = "text-muted-foreground"
  if (isOverdue) {
    className = "font-medium text-red-600 dark:text-red-400"
  } else if (isDueToday) {
    className = "font-medium text-amber-700 dark:text-amber-400"
  }
  return { label: task.dueDate, className }
}

export default function TasksPage() {
  const jwt = useJwtAgent()
  const agentId = jwt?.agentId ?? null
  const { data: tasks, isLoading, error } = useTasksByAgent(agentId)
  const updateTask = useUpdateTask()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [sorting, setSorting] = useState<SortingState>([{ id: "dueDate", desc: false }])

  const rows = useMemo(() => {
    let t = tasks ?? []
    if (statusFilter !== "all") {
      t = t.filter((x) => x.status === statusFilter)
    }
    return t
  }, [tasks, statusFilter])

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "dueDate",
        header: "Due",
        sortingFn: (a, b) => a.original.dueDate.localeCompare(b.original.dueDate),
        cell: ({ row }) => {
          const { label, className } = dueMeta(row.original)
          return <span className={className}>{label}</span>
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const task = row.original
          return (
            <Select
              value={task.status}
              onValueChange={(v) => {
                if (!v) {
                  return
                }
                const next = v as TaskStatus
                updateTask.mutate(
                  {
                    id: task.id,
                    data: {
                      title: task.title,
                      description: task.description,
                      dueDate: task.dueDate,
                      status: next,
                    },
                  },
                  { onError: (err) => toast.error(getErrorMessage(err)) }
                )
              }}
            >
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Notes",
        cell: ({ getValue }) => {
          const v = getValue() as string | null
          return <span className="line-clamp-2 text-muted-foreground">{v ?? "—"}</span>
        },
      },
    ],
    [updateTask]
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v as TaskStatus | "all") ?? "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks for this filter.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 px-2 font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </Button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
