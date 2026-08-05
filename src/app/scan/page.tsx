"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

export default function ScanPage() {
  const [qrInput, setQrInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace("/login")
    }
  }, [router])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrInput.trim()) return

    setIsSubmitting(true)
    setMessage("")
    setIsSuccess(false)

    try {
      const result = await api.scanQRCode(qrInput.trim())

      if (result.error) {
        setMessage(result.error)
      } else if (result.data) {
        setMessage(result.data.message)
        setIsSuccess(true)
        setQrInput("")
      }
    } catch {
      setMessage("Error al procesar el código QR")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-[64px] text-primary">
            qr_code_scanner
          </span>
          <h2 className="mt-4 text-2xl font-bold text-on-surface">
            Registrar Asistencia
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Ingresa el código QR o escanea con la cámara
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface">
              Datos del QR
            </label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Pega aquí el contenido del código QR..."
              rows={4}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="text-center text-on-surface-variant">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-on-surface-variant">O escanea con la cámara</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8">
              <span className="material-symbols-outlined text-[48px] text-outline">
                photo_camera
              </span>
              <p className="mt-2 text-sm text-on-surface-variant">
                La funcionalidad de cámara estará disponible próximamente
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                isSuccess
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-error-container text-error"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isSuccess ? "check_circle" : "error"}
              </span>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !qrInput.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                Verificando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">qr_code_scanner</span>
                Registrar Asistencia
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver
        </button>
      </div>
    </div>
  )
}