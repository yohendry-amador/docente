"use client"



import { useState, useEffect, useCallback, useRef } from "react"

import { useRouter } from "next/navigation"

import Link from "next/link"

import { api } from "@/lib/api/client"

import { Html5Qrcode } from "html5-qrcode"







export default function StudentScanPage() {

  const [qrInput, setQrInput] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [message, setMessage] = useState("")

  const [isSuccess, setIsSuccess] = useState(false)


  const [isCameraActive, setIsCameraActive] = useState(false)

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)

  const router = useRouter()



  useEffect(() => {

    const userStr = localStorage.getItem("user")

    if (!userStr) {

      router.replace("/login")

      return

    }

    const user = JSON.parse(userStr)

    if (user.role !== "STUDENT") {

      router.replace("/scan")

    }

  }, [router])



  const stopCamera = useCallback(() => {

    if (html5QrcodeRef.current) {

      try {

        html5QrcodeRef.current.stop()

      } catch {

        // ignore stop errors

      }

      html5QrcodeRef.current = null

    }

    setIsCameraActive(false)

  }, [])



  useEffect(() => {

    return () => stopCamera()

  }, [stopCamera])



  const submitQRValue = useCallback(async (value: string) => {

    if (!value.trim()) return



    setIsSubmitting(true)

    setMessage("")

    setIsSuccess(false)




    try {

      const result = await api.scanQRCode(value.trim())

      if (result.error) {

        setMessage(result.error)


      } else if (result.data) {

        setMessage(result.data.message)

        setIsSuccess(true)

        setQrInput("")

        stopCamera()

      }

    } catch {

      setMessage("Error al procesar el codigo QR")


    }



    setIsSubmitting(false)

  }, [stopCamera])

const startCamera = async () => {

    setMessage("")

    setIsSuccess(false)


    try {

      const html5Qrcode = new Html5Qrcode("qr-video")

      html5QrcodeRef.current = html5Qrcode

      await html5Qrcode.start(

        { facingMode: "environment" },

        { fps: 10, qrbox: 250 },

        (decodedText) => {

          setQrInput(decodedText)

          submitQRValue(decodedText)

        },

        () => {

          // ignore scan errors

        }

      )

      setIsCameraActive(true)

    } catch {

      setMessage("No se pudo acceder a la camara. Revisa permisos del navegador.")

      stopCamera()

    }

  }



  const handleScan = async (e: React.FormEvent) => {

    e.preventDefault()

    await submitQRValue(qrInput)

  }



  return (

    <div className="min-h-screen bg-background">

      <nav className="border-b border-outline-variant bg-surface px-6 py-4">

        <Link href="/student" className="flex items-center gap-2 text-on-surface-variant hover:text-primary">

          <span className="material-symbols-outlined">arrow_back</span>

          <span>Volver al inicio</span>

        </Link>

      </nav>



      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">

        <div className="w-full max-w-md">

          <div className="mb-8 text-center">

            <span className="material-symbols-outlined text-[64px] text-primary">

              qr_code_scanner

            </span>

            <h2 className="mt-4 text-2xl font-bold text-on-surface">

              Escanear Código QR

            </h2>

            <p className="mt-2 text-on-surface-variant">

              Registra tu asistencia escaneando el código QR proporcionado por tu profesor

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

                className="min-h-32 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"

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



              <div className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-4">
                <div id="qr-video" className={isCameraActive ? "mb-3 h-56 w-full rounded-lg bg-black" : "hidden"} />
                <button

                  type="button"

                  onClick={isCameraActive ? stopCamera : startCamera}

                  disabled={isSubmitting}

                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5 disabled:opacity-70"

                >

                  <span className="material-symbols-outlined text-lg">photo_camera</span>

                  {isCameraActive ? "Detener camara" : "Abrir camara"}

                </button>

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

        </div>

      </div>

    </div>

  )

}