import axios from "axios"
import { getToken } from "@/lib/auth-token"

function resolveApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!raw) {
    return "http://localhost:8080"
  }
  return raw.replace(/\/$/, "")
}

const baseURL = resolveApiBaseUrl()

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
