"use client"

import { useEffect } from "react"

export function DevCleanup() {
  useEffect(() => {
    // Unregister any existing service workers that might be interfering (e.g., Vite SW)
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => {
          regs.forEach((reg) => {
            try { reg.unregister() } catch {}
          })
        })
        .catch(() => {})
    }

    // Optionally clear any caches created by previous SWs
    if (typeof window !== "undefined" && (window as any).caches) {
      try {
        (window as any).caches.keys().then((keys: string[]) => {
          keys.forEach((key) => {
            try { (window as any).caches.delete(key) } catch {}
          })
        })
      } catch {}
    }
  }, [])

  return null
}