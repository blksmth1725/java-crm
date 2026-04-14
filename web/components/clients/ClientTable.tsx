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
import type { Client } from "@/lib/types"
import { useDeleteClient } from "@/hooks/useClients"

type Props = {
  clients: Client[] | undefined
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

export function ClientTable({ clients, isLoading, error, onRowClick }: Props) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const deleteClient = useDeleteClient()

  const filtered = useMemo(() => {
    const rows = clients ?? []
    const q = globalFilter.trim().toLowerCase()
    if (!q) {
      return rows
    }
    return rows.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [clients, globalFilter])

  const columns = useMemo<ColumnDef<Client>[]>(
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
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={deleteClient.isPending}
              onClick={() =>
                deleteClient.mutate(row.original.id, {
                  onSuccess: () => toast.success("Client deleted"),
                  onError: (err) => toast.error(getErrorMessage(err)),
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteClient]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: { pagination: { pageSize: 10 } },
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
      <Input
        placeholder="Search name or email…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm shrink-0"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clients found.</p>
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
