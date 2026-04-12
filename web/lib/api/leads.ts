import { api } from "@/lib/axios"
import type { Client, Lead, LeadStatus } from "@/lib/types"

export interface CreateLeadInput {
  agentId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  region?: string
  status?: LeadStatus
  notes?: string
}

export interface UpdateLeadInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  region?: string
  status: LeadStatus
  notes?: string | null
}

export async function getLeads(): Promise<Lead[]> {
  const { data } = await api.get<Lead[]>("/api/leads")
  return data
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await api.get<Lead>(`/api/leads/${id}`)
  return data
}

export async function getLeadsByAgent(agentId: string): Promise<Lead[]> {
  const { data } = await api.get<Lead[]>(`/api/leads/agent/${agentId}`)
  return data
}

export async function createLead(body: CreateLeadInput): Promise<Lead> {
  const { data } = await api.post<Lead>("/api/leads", body)
  return data
}

export async function updateLead(id: string, body: UpdateLeadInput): Promise<Lead> {
  const { data } = await api.put<Lead>(`/api/leads/${id}`, body)
  return data
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/api/leads/${id}`)
}

export async function convertLead(id: string): Promise<Client> {
  const { data } = await api.post<Client>(`/api/leads/${id}/convert`)
  return data
}
