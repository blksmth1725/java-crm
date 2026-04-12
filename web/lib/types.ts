export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type InteractionType = "CALL" | "EMAIL" | "MEETING" | "NOTE"

export type AgentRole = "AGENT" | "ADMIN"

export interface Lead {
  id: string
  agentId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  region: string | null
  status: LeadStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  agentId: string
  leadId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  region: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  agentId: string
  leadId: string | null
  clientId: string | null
  title: string
  description: string | null
  dueDate: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface Interaction {
  id: string
  agentId: string
  leadId: string | null
  clientId: string | null
  type: InteractionType
  summary: string
  occurredAt: string
  createdAt: string
}

export interface PipelineStatsResponse {
  agentId: string
  agentName: string
  totalLeads: number
  leadsByStatus: Record<string, number> | string
  totalClients: number
  totalInteractions: number
  totalPendingTasks: number
  generatedAt: string
}

export interface AuthResponse {
  token: string
  agentId: string
  email: string
  firstName: string
  role: AgentRole
}
