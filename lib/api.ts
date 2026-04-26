export type Transport = "none" | "sms" | "whatsapp"

export async function fetcher(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function sendChat(params: {
  message: string
  language: string
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Chat error: ${res.status}`)
  }
  return res.json()
}

export async function fetchHealthData(url: string) {
  return fetcher(url)
}

export function getOrCreateUserId() {
  try {
    const key = "healthbot_user_id"
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    // SSR fallback
    return "anonymous"
  }
}
