"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRedirectPathForRole } from "@/lib/auth/redirect"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      const redirectPath = getRedirectPathForRole(user.role)
      router.replace(redirectPath)
    } else {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="animate-spin text-[64px] text-primary">EduPortal</span>
    </div>
  )
}