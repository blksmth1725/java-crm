"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/errors"
import { useJwtAgent } from "@/hooks/use-agent-jwt"
import { useConvertLead, useLead } from "@/hooks/useLeads"
import { useCreateInteraction, useInteractionsByLead } from "@/hooks/useInteractions"
import { useCreateTask, useTasksByLead } from "@/hooks/useTasks"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"
import type { InteractionType, TaskStatus } from "@/lib/types"

const interactionTypes: InteractionType[] = ["CALL", "EMAIL", "MEETING", "NOTE"]
const taskStatuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

type Tab = "overview" | "interactions" | "tasks"

export function LeadDetailDrawer({
  leadId,
  onClose,
}: {
  leadId: string | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>("overview")
  const jwt = useJwtAgent()
  const agentId = jwt?.agentId ?? ""

  const { data: lead, isLoading, error } = useLead(leadId ?? "")
  const { data: interactions, isLoading: ixLoading } = useInteractionsByLead(leadId)
  const { data: tasks, isLoading: tasksLoading } = useTasksByLead(leadId)

  const convertLead = useConvertLead()
  const createIx = useCreateInteraction()
  const createTask = useCreateTask()

  const [ixType, setIxType] = useState<InteractionType>("CALL")
  const [ixSummary, setIxSummary] = useState("")
  const [ixAt, setIxAt] = useState(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })

  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskDue, setTaskDue] = useState(() => new Date().toISOString().slice(0, 10))
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("PENDING")

  function submitInteraction(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !agentId) {
      return
    }
    const occurredAt = new Date(ixAt).toISOString()
    createIx.mutate(
      {
        agentId,
        leadId,
        type: ixType,
        summary: ixSummary.trim(),
        occurredAt,
      },
      {
        onSuccess: () => {
          toast.success("Interaction logged")
          setIxSummary("")
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    )
  }

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !agentId) {
      return
    }
    createTask.mutate(
      {
        agentId,
        leadId,
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        dueDate: taskDue,
        status: taskStatus,
      },
      {
        onSuccess: () => {
          toast.success("Task created")
          setTaskTitle("")
          setTaskDesc("")
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    )
  }

  return (
    <Sheet
      open={!!leadId}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="flex w-full max-w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Lead</SheetTitle>
          <SheetDescription>
            {lead ? `${lead.firstName} ${lead.lastName}` : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex gap-1 border-b border-border pb-2">
          {(
            [
              ["overview", "Overview"],
              ["interactions", "Interactions"],
              ["tasks", "Tasks"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={tab === id ? "default" : "ghost"}
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-4 py-4">
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          )}

          {lead && tab === "overview" && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <LeadStatusBadge status={lead.status} />
              </div>
              <p>
                <span className="text-muted-foreground">Email:</span> {lead.email}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span> {lead.phone ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Region:</span> {lead.region ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Notes:</span> {lead.notes ?? "—"}
              </p>
              <Separator />
              <Button
                type="button"
                disabled={convertLead.isPending || lead.status === "CLOSED_WON"}
                onClick={() =>
                  convertLead.mutate(lead.id, {
                    onSuccess: () => {
                      toast.success("Lead converted to client")
                      onClose()
                    },
                    onError: (err) => toast.error(getErrorMessage(err)),
                  })
                }
              >
                Convert to client
              </Button>
            </div>
          )}

          {lead && tab === "interactions" && (
            <div className="space-y-4">
              <form className="space-y-2 rounded-lg border border-border p-3" onSubmit={submitInteraction}>
                <p className="text-xs font-medium text-muted-foreground">Log interaction</p>
                <div className="space-y-1">
                  <Label htmlFor="ix-type">Type</Label>
                  <Select value={ixType} onValueChange={(v) => setIxType(v as InteractionType)}>
                    <SelectTrigger id="ix-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interactionTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ix-sum">Summary</Label>
                  <Textarea
                    id="ix-sum"
                    value={ixSummary}
                    onChange={(e) => setIxSummary(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ix-at">Occurred at</Label>
                  <Input
                    id="ix-at"
                    type="datetime-local"
                    value={ixAt}
                    onChange={(e) => setIxAt(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="sm" disabled={createIx.isPending}>
                  Save
                </Button>
              </form>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">History</p>
                {ixLoading && <Skeleton className="h-16 w-full" />}
                {!ixLoading && (interactions?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No interactions yet.</p>
                )}
                {interactions?.map((ix) => (
                  <div key={ix.id} className="rounded-md border border-border p-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{ix.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ix.occurredAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{ix.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lead && tab === "tasks" && (
            <div className="space-y-4">
              <form className="space-y-2 rounded-lg border border-border p-3" onSubmit={submitTask}>
                <p className="text-xs font-medium text-muted-foreground">New task</p>
                <div className="space-y-1">
                  <Label htmlFor="t-title">Title</Label>
                  <Input
                    id="t-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="t-desc">Description</Label>
                  <Textarea
                    id="t-desc"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="t-due">Due date</Label>
                  <Input
                    id="t-due"
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as TaskStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" size="sm" disabled={createTask.isPending}>
                  Add task
                </Button>
              </form>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tasks</p>
                {tasksLoading && <Skeleton className="h-16 w-full" />}
                {!tasksLoading && (tasks?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                )}
                {tasks?.map((t) => (
                  <div key={t.id} className="rounded-md border border-border p-2 text-sm">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due {t.dueDate} · {t.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
