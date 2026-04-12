import { api } from "@/lib/axios"
import type { Client } from "@/lib/types"

export interface UpdateClientInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  region?: string
  notes?: string | null
}

export async function getClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>("/api/clients")
  return data
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get<Client>(`/api/clients/${id}`)
  return data
}

export async function getClientsByAgent(agentId: string): Promise<Client[]> {
  const { data } = await api.get<Client[]>(`/api/clients/agent/${agentId}`)
  return data
}

export async function updateClient(id: string, body: UpdateClientInput): Promise<Client> {
  const { data } = await api.put<Client>(`/api/clients/${id}`, body)
  return data
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/api/clients/${id}`)
}
