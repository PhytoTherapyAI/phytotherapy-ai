// © 2026 DoctoPal — All Rights Reserved
// Dashboard → root redirect
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { router.replace("/") }, [])
  return null
}
