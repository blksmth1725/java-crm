import { api } from "@/lib/axios"
import type { AgentRole, AuthResponse } from "@/lib/types"

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
  region: string
  role: AgentRole
}

export async function login(body: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", body)
  return data
}

export async function register(body: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/register", body)
  return data
}
