"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  convertLead,
  createLead,
  deleteLead,
  getLead,
  getLeadsByAgent,
  updateLead,
  type CreateLeadInput,
  type UpdateLeadInput,
} from "@/lib/api/leads"

export function useLeads(agentId: string | null) {
  return useQuery({
    queryKey: ["leads", agentId],
    queryFn: () => getLeadsByAgent(agentId!),
    enabled: !!agentId,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => getLead(id),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) => updateLead(id, data),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.setQueryData(["leads", updatedLead.id], updatedLead)
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useConvertLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: convertLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}

export type { CreateLeadInput }
