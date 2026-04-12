"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/errors"
import { LEAD_STATUS_LABELS, LEAD_STATUS_VALUES } from "@/lib/lead-status"
import type { LeadStatus } from "@/lib/types"
import { useCreateLead } from "@/hooks/useLeads"

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  region: z.string().optional(),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL_SENT",
    "NEGOTIATING",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof createLeadSchema>

export function CreateLeadForm({
  open,
  onOpenChange,
  agentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
}) {
  const createLead = useCreateLead()
  const form = useForm<FormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      region: "",
      status: "NEW",
      notes: "",
    },
  })

  function onSubmit(values: FormValues) {
    createLead.mutate(
      {
        agentId,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        region: values.region?.trim() || undefined,
        status: values.status as LeadStatus,
        notes: values.notes?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Lead created")
          form.reset()
          onOpenChange(false)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset()
        }
      }}
    >
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>Add a lead to your pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="cl-fn">First name</Label>
              <Input id="cl-fn" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cl-ln">Last name</Label>
              <Input id="cl-ln" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cl-em">Email</Label>
            <Input id="cl-em" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="cl-ph">Phone</Label>
              <Input id="cl-ph" {...form.register("phone")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cl-rg">Region</Label>
              <Input id="cl-rg" {...form.register("region")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as FormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-1">
            <Label htmlFor="cl-no">Notes</Label>
            <Textarea id="cl-no" rows={3} {...form.register("notes")} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
