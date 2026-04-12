import { api } from "@/lib/axios"
import type { Interaction, InteractionType } from "@/lib/types"

export interface CreateInteractionInput {
  agentId: string
  leadId?: string
  clientId?: string
  type: InteractionType
  summary: string
  occurredAt: string
}

export async function getInteractionsByLead(leadId: string): Promise<Interaction[]> {
  const { data } = await api.get<Interaction[]>(`/api/interactions/lead/${leadId}`)
  return data
}

export async function getInteractionsByClient(clientId: string): Promise<Interaction[]> {
  const { data } = await api.get<Interaction[]>(`/api/interactions/client/${clientId}`)
  return data
}

export async function createInteraction(body: CreateInteractionInput): Promise<Interaction> {
  const { data } = await api.post<Interaction>("/api/interactions", body)
  return data
}

export async function deleteInteraction(id: string): Promise<void> {
  await api.delete(`/api/interactions/${id}`)
}
