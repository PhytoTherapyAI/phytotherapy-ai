// © 2026 Doctopal — All Rights Reserved
// Dashboard → root redirect
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/") }, [router])
  return null
}
