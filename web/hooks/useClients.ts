"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteClient,
  getClient,
  getClientsByAgent,
  updateClient,
  type UpdateClientInput,
} from "@/lib/api/clients"

export function useClients(agentId: string | null) {
  return useQuery({
    queryKey: ["clients", agentId],
    queryFn: () => getClientsByAgent(agentId!),
    enabled: !!agentId,
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id),
    enabled: !!id,
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) => updateClient(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.setQueryData(["clients", updated.id], updated)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}
