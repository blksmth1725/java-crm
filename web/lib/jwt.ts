export interface JwtPayload {
  sub: string
  agentId: string
  firstName?: string
  role: string
  exp: number
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((segment.length + 3) % 4)
  if (typeof atob === "undefined") {
    return Buffer.from(padded, "base64").toString("utf8")
  }
  return atob(padded)
}

export function decodeToken(token: string): JwtPayload {
  const parts = token.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format")
  }
  const json = base64UrlDecode(parts[1])
  return JSON.parse(json) as JwtPayload
}
