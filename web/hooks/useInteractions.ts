"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createInteraction,
  deleteInteraction,
  getInteractionsByClient,
  getInteractionsByLead,
  type CreateInteractionInput,
} from "@/lib/api/interactions"

export function useInteractionsByLead(leadId: string | null) {
  return useQuery({
    queryKey: ["interactions", "lead", leadId],
    queryFn: () => getInteractionsByLead(leadId!),
    enabled: !!leadId,
  })
}

export function useInteractionsByClient(clientId: string | null) {
  return useQuery({
    queryKey: ["interactions", "client", clientId],
    queryFn: () => getInteractionsByClient(clientId!),
    enabled: !!clientId,
  })
}

export function useCreateInteraction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInteraction,
    onSuccess: (_, variables) => {
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["interactions", "lead", variables.leadId] })
      }
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: ["interactions", "client", variables.clientId] })
      }
    },
  })
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInteraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactions"] })
    },
  })
}

export type { CreateInteractionInput }
