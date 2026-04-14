"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateLeadForm } from "@/components/leads/CreateLeadForm"
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer"
import { LeadTable } from "@/components/leads/LeadTable"
import { useJwtAgent } from "@/hooks/use-agent-jwt"
import { useLeads } from "@/hooks/useLeads"

export default function LeadsPage() {
  const jwt = useJwtAgent()
  const agentId = jwt?.agentId ?? null
  const { data: leads, isLoading, error } = useLeads(agentId)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Manage pipeline and conversions.</p>
        <Button type="button" onClick={() => setCreateOpen(true)} disabled={!agentId}>
          New lead
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          error={error}
          onRowClick={(id) => setSelectedLeadId(id)}
        />
      </div>
      <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      {agentId && (
        <CreateLeadForm open={createOpen} onOpenChange={setCreateOpen} agentId={agentId} />
      )}
    </div>
  )
}
