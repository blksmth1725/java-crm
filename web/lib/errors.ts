import axios from "axios"

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim()) {
      return data
    }
    if (data && typeof data === "object") {
      const msg = (data as { message?: string }).message
      if (typeof msg === "string") {
        return msg
      }
    }
    return error.response?.statusText ?? "Something went wrong"
  }
  return "An unexpected error occurred"
}
