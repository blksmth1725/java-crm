import { api } from "@/lib/axios"
import type { Task, TaskStatus } from "@/lib/types"

export interface CreateTaskInput {
  agentId: string
  leadId?: string
  clientId?: string
  title: string
  description?: string
  dueDate: string
  status?: TaskStatus
}

export interface UpdateTaskInput {
  title: string
  description?: string | null
  dueDate: string
  status: TaskStatus
}

export async function getTasksByAgent(agentId: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/api/tasks/agent/${agentId}`)
  return data
}

export async function getTasksByLead(leadId: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/api/tasks/lead/${leadId}`)
  return data
}

export async function getTasksByClient(clientId: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/api/tasks/client/${clientId}`)
  return data
}

export async function createTask(body: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<Task>("/api/tasks", body)
  return data
}

export async function updateTask(id: string, body: UpdateTaskInput): Promise<Task> {
  const { data } = await api.put<Task>(`/api/tasks/${id}`, body)
  return data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`)
}
