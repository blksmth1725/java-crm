"use client"

import { useState } from "react"
import { ClientDetailDrawer } from "@/components/clients/ClientDetailDrawer"
import { ClientTable } from "@/components/clients/ClientTable"
import { useJwtAgent } from "@/hooks/use-agent-jwt"
import { useClients } from "@/hooks/useClients"

export default function ClientsPage() {
  const jwt = useJwtAgent()
  const agentId = jwt?.agentId ?? null
  const { data: clients, isLoading, error } = useClients(agentId)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Converted accounts for your book.</p>
      <ClientTable
        clients={clients}
        isLoading={isLoading}
        error={error}
        onRowClick={(id) => setSelectedId(id)}
      />
      <ClientDetailDrawer clientId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
