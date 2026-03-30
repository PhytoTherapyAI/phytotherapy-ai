// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // First: unregister any old/broken service workers and clear caches
    async function cleanAndRegister() {
      try {
        // Clear all caches from previous SW versions
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))

        // Register the new (safe) service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none", // Always fetch fresh SW
        })
        console.log("[SW] Registered:", registration.scope)

        // Force update check
        registration.update()
      } catch (error) {
        console.error("[SW] Registration failed:", error)
      }
    }

    cleanAndRegister()

    // Listen for online/offline events
    const handleOnline = () => document.documentElement.classList.remove("offline")
    const handleOffline = () => document.documentElement.classList.add("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return null
}
