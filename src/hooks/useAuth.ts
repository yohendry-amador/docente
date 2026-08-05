"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

export function useAuthCheck() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const hasToken = api.isAuthenticated()

      if (!hasToken) {
        router.replace("/login")
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  return isLoading
}

export function useGuestCheck() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkGuest = () => {
      const hasToken = api.isAuthenticated()

      if (hasToken) {
        router.replace("/")
        return
      }

      setIsLoading(false)
    }

    checkGuest()
  }, [router])

  return isLoading
}