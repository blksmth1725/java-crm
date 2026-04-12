"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTask,
  deleteTask,
  getTasksByAgent,
  getTasksByClient,
  getTasksByLead,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/api/tasks"

export function useTasksByAgent(agentId: string | null) {
  return useQuery({
    queryKey: ["tasks", "agent", agentId],
    queryFn: () => getTasksByAgent(agentId!),
    enabled: !!agentId,
  })
}

export function useTasksByLead(leadId: string | null) {
  return useQuery({
    queryKey: ["tasks", "lead", leadId],
    queryFn: () => getTasksByLead(leadId!),
    enabled: !!leadId,
  })
}

export function useTasksByClient(clientId: string | null) {
  return useQuery({
    queryKey: ["tasks", "client", clientId],
    queryFn: () => getTasksByClient(clientId!),
    enabled: !!clientId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "lead", variables.leadId] })
      }
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "client", variables.clientId] })
      }
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => updateTask(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      if (updated.leadId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "lead", updated.leadId] })
      }
      if (updated.clientId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "client", updated.clientId] })
      }
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export type { CreateTaskInput }
