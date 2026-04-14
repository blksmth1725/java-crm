"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  compareLeadStatusPipeline,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_VALUES,
} from "@/lib/lead-status"
import type { Lead, LeadStatus } from "@/lib/types"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"
import { useConvertLead, useDeleteLead, useUpdateLead } from "@/hooks/useLeads"

type LeadTableProps = {
  leads: Lead[] | undefined
  isLoading: boolean
  error: Error | null
  onRowClick: (id: string) => void
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export function LeadTable({ leads, isLoading, error, onRowClick }: LeadTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sorting, setSorting] = useState<SortingState>([{ id: "status", desc: false }])
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const convertLead = useConvertLead()

  const filteredData = useMemo(() => {
    let rows = leads ?? []
    const q = globalFilter.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (l) =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      rows = rows.filter((l) => l.status === statusFilter)
    }
    return rows
  }, [leads, globalFilter, statusFilter])

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ getValue }) => (getValue() as string | null) ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        sortingFn: (a, b) => compareLeadStatusPipeline(a.original.status, b.original.status),
        cell: ({ row }) => {
          const lead = row.original
          return (
            <div
              className="flex max-w-[220px] flex-col gap-1 sm:flex-row sm:items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <LeadStatusBadge status={lead.status} />
              <Select
                value={lead.status}
                onValueChange={(value: string | null) => {
                  if (!value) {
                    return
                  }
                  const next = value as LeadStatus
                  updateLead.mutate(
                    {
                      id: lead.id,
                      data: {
                        firstName: lead.firstName,
                        lastName: lead.lastName,
                        email: lead.email,
                        phone: lead.phone ?? undefined,
                        region: lead.region ?? undefined,
                        status: next,
                        notes: lead.notes,
                      },
                    },
                    {
                      onError: (err) => toast.error(getErrorMessage(err)),
                    }
                  )
                }}
              >
                <SelectTrigger size="sm" className="h-8 w-full min-w-0 sm:w-[140px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const lead = row.original
          return (
            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={convertLead.isPending || lead.status === "CLOSED_WON"}
                onClick={() =>
                  convertLead.mutate(lead.id, {
                    onSuccess: () => toast.success("Lead converted to client"),
                    onError: (err) => toast.error(getErrorMessage(err)),
                  })
                }
              >
                Convert
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={deleteLead.isPending}
                onClick={() =>
                  deleteLead.mutate(lead.id, {
                    onSuccess: () => toast.success("Lead deleted"),
                    onError: (err) => toast.error(getErrorMessage(err)),
                  })
                }
              >
                Delete
              </Button>
            </div>
          )
        },
      },
    ],
    [convertLead, deleteLead, updateLead]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "status", desc: false }],
    },
  })

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex max-w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name or email…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v as LeadStatus | "all") ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leads match your filters.</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={
                              header.column.getCanSort()
                                ? "inline-flex cursor-pointer select-none items-center gap-1 font-medium"
                                : undefined
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(row.original.id)}
                  >
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
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
