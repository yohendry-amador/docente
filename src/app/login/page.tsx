"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { getRedirectPathForRole } from "@/lib/auth/redirect"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (api.isAuthenticated()) {
      const storedUser = localStorage.getItem("user")
      const parsedUser = storedUser ? JSON.parse(storedUser) : null
      router.replace(getRedirectPathForRole(parsedUser?.role))
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await api.login(email, password)

      if (result.error) {
        setError("Credenciales inválidas. Verifica tu email y contraseña.")
        setIsLoading(false)
        return
      }

      if (result.data) {
        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("rememberMe", "true")
        }

        const redirectPath = getRedirectPathForRole(result.data.user?.role)
        router.replace(redirectPath)
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-primary-container">EduPortal</h1>
          <p className="mt-2 text-on-primary-container/80">Gestión Académica</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-on-primary-container">
            Gestión académica<br />simplificada
          </h2>
          <p className="text-lg text-on-primary-container/80">
            Controla la asistencia, gestiona tus asignaturas y genera reportes
            en una plataforma moderna y fácil de usar.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary-container bg-secondary text-sm font-bold text-on-secondary">
                AM
              </div>
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary-container bg-tertiary-container text-sm font-bold text-on-tertiary-container">
                JP
              </div>
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary-container bg-secondary-container text-sm font-bold text-on-secondary-container">
                MR
              </div>
            </div>
            <p className="text-sm text-on-primary-container/80">
              +500 profesores ya confían en nosotros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-on-primary-container/60">
          <span className="material-symbols-outlined text-lg">school</span>
          <span className="text-sm">Universidad · 2026</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-bold text-primary">EduPortal</h1>
            <p className="text-sm text-on-surface-variant">Gestión Académica</p>
          </div>

          <h2 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-container px-4 py-3 text-sm text-error">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    mail
                  </span>
                  <input
                    type="email"
                    placeholder="profesor@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">Recordarme</span>
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              ¿No tienes cuenta?{" "}
              <button className="font-medium text-primary hover:underline">
                Contacta al administrador
              </button>
            </p>
          </div>

          <div className="mt-12 border-t border-outline-variant pt-8">
            <p className="text-center text-xs text-on-surface-variant">
              Al iniciar sesión, aceptas los{" "}
              <button className="text-primary hover:underline">Términos de Servicio</button>{" "}
              y la{" "}
              <button className="text-primary hover:underline">Política de Privacidad</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}