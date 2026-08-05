"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api/client"
import { getRedirectPathForRole } from "@/lib/auth/redirect"

const publicPaths = ["/login", "/scan"]

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const lastAuthRef = useRef<boolean | null>(null)

  useEffect(() => {
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
    const isAuthenticated = api.isAuthenticated()

    if (lastAuthRef.current === null) {
      lastAuthRef.current = isAuthenticated
    }

    if (!isPublicPath && !isAuthenticated) {
      router.replace("/login")
      return
    }

    if (isPublicPath && isAuthenticated) {
      const storedUser = localStorage.getItem("user")
      const parsedUser = storedUser ? JSON.parse(storedUser) : null
      router.replace(getRedirectPathForRole(parsedUser?.role))
      return
    }

    const timer = setTimeout(() => setIsLoading(false), 0)
    return () => clearTimeout(timer)
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}