"use client"

import { useEffect, useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/errors"
import { useUpdateTask } from "@/hooks/useTasks"
import type { Task, TaskStatus } from "@/lib/types"

const taskStatuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

export function TaskEditDrawer({
  task,
  onClose,
}: {
  task: Task | null
  onClose: () => void
}) {
  const updateTask = useUpdateTask()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<TaskStatus>("PENDING")

  useEffect(() => {
    if (!task) {
      return
    }
    setTitle(task.title)
    setDescription(task.description ?? "")
    setDueDate(task.dueDate)
    setStatus(task.status)
  }, [task])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task) {
      return
    }
    updateTask.mutate(
      {
        id: task.id,
        data: {
          title: title.trim(),
          description: description.trim() || null,
          dueDate,
          status,
        },
      },
      {
        onSuccess: () => {
          toast.success("Task updated")
          onClose()
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    )
  }

  return (
    <Sheet
      open={!!task}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="flex w-full max-w-full flex-col gap-0 overflow-y-auto px-4 pb-4 sm:max-w-md">
        <SheetHeader className="shrink-0 p-0 pt-4 text-left">
          <SheetTitle>Task</SheetTitle>
          <SheetDescription>
            {task ? "Edit details and save changes." : ""}
          </SheetDescription>
        </SheetHeader>

        {task && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-task-desc">Description</Label>
              <Textarea
                id="edit-task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-task-due">Due date</Label>
              <Input
                id="edit-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
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
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateTask.isPending}>
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
