"use client"



import { useState, useEffect, Suspense, useCallback, useRef } from "react"

import Link from "next/link"

import Image from "next/image"

import { useSearchParams } from "next/navigation"

import { AppShell } from "@/components/app-shell"

import { api, type AttendanceRecord, type Section, type QRGenerationResponse } from "@/lib/api/client"

import QRCode from "qrcode"



type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {

  detect(image: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>

}



function AttendancePageContent() {

  const searchParams = useSearchParams()

  const sectionId = searchParams.get("sectionId")



  const [section, setSection] = useState<Section | null>(null)

  const [qrData, setQrData] = useState<QRGenerationResponse | null>(null)

  const [qrImageUrl, setQrImageUrl] = useState<string>("")

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([])

  const [timeLeft, setTimeLeft] = useState<number>(0)

  const [searchQuery, setSearchQuery] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const [error, setError] = useState<string>("")

  const [scannerMessage, setScannerMessage] = useState("")

  const [isCameraActive, setIsCameraActive] = useState(false)

  const [noSectionId, setNoSectionId] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const streamRef = useRef<MediaStream | null>(null)

  const scanFrameRef = useRef<number | null>(null)



  const fetchAttendance = useCallback(async (sessionId?: string) => {

    if (!sectionId) return

    try {

      const attendanceResult = await api.getSectionAttendance(sectionId, sessionId)

      if (attendanceResult.data) {

        setAttendanceList(attendanceResult.data)

      }

    } catch {

      // Silently handle error

    }

  }, [sectionId])



  const stopCamera = useCallback(() => {

    if (scanFrameRef.current) {

      cancelAnimationFrame(scanFrameRef.current)

      scanFrameRef.current = null

    }

    streamRef.current?.getTracks().forEach((track) => track.stop())

    streamRef.current = null

    setIsCameraActive(false)

  }, [])



  const registerScannedQR = useCallback(async (value: string) => {

    setScannerMessage(value.trim() ? "QR detectado correctamente" : "No se pudo leer el QR")

    stopCamera()

  }, [stopCamera])



  const startCamera = async () => {

    setScannerMessage("")

    const browserWindow = window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }

    if (!browserWindow.BarcodeDetector) {

      setScannerMessage("Tu navegador no soporta lectura QR por cámara. Usa el pegado manual en la pantalla del estudiante.")

      return

    }



    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })

      streamRef.current = stream

      setIsCameraActive(true)



      if (videoRef.current) {

        videoRef.current.srcObject = stream

        await videoRef.current.play()

      }



      const detector = new browserWindow.BarcodeDetector({ formats: ["qr_code"] })

      const scan = async () => {

        if (!videoRef.current || !streamRef.current) return

        try {

          const codes = await detector.detect(videoRef.current)

          const value = codes.find((code) => code.rawValue)?.rawValue

          if (value) {

            await registerScannedQR(value)

            return

          }

        } catch {

          setScannerMessage("No se pudo leer el QR desde la cámara")

        }

        scanFrameRef.current = requestAnimationFrame(scan)

      }

      scanFrameRef.current = requestAnimationFrame(scan)

    } catch {

      setScannerMessage("No se pudo acceder a la cámara. Revisa permisos del navegador.")

      stopCamera()

    }

  }



  const generateQR = async () => {

    if (!sectionId) return

    setIsGeneratingQR(true)

    setError("")



    const result = await api.generateQRCode(sectionId, 600)

    if (result.error) {

      setError(result.error)

      setIsGeneratingQR(false)

      return

    }

    if (result.data) {

      setQrData(result.data)

      const expiresAt = new Date(result.data.expiresAt).getTime()

      setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))

    }

    setIsGeneratingQR(false)

  }



  const closeSession = async () => {

    if (!qrData?.sessionId) return



    const result = await api.closeQRSession(qrData.sessionId)

    if (!result.error) {

      setQrData(null)

      setQrImageUrl("")

      setTimeLeft(0)

      stopCamera()

    }

  }



  useEffect(() => {

    if (!sectionId) {

      const timer = setTimeout(() => {
        setNoSectionId(true)
        setIsLoading(false)
      }, 0)
      return () => clearTimeout(timer)

    }



    let cancelled = false



    const loadData = async () => {

      if (cancelled) return

      setIsLoading(true)

      const sectionResult = await api.getSection(sectionId)

      if (cancelled) return

      if (sectionResult.error) {

        setError(sectionResult.error)

      } else if (sectionResult.data) {

        setSection(sectionResult.data)

      }



      const activeSession = await api.getActiveSession(sectionId)

      if (cancelled) return

      if (activeSession.data) {

        const expiresAt = new Date(activeSession.data.endTime).getTime()

        if (expiresAt > Date.now()) {

          setTimeLeft(Math.floor((expiresAt - Date.now()) / 1000))

          setQrData({

            sessionId: activeSession.data.id,

            sectionId: sectionId,

            qrData: activeSession.data.qrCode || "",

            expiresAt: activeSession.data.endTime,

          })

        }

      }

      if (!cancelled) setIsLoading(false)

    }



    loadData()

    return () => {

      cancelled = true

    }

  }, [sectionId])



  useEffect(() => {

    return () => stopCamera()

  }, [stopCamera])



  useEffect(() => {

    if (qrData?.qrData) {

      QRCode.toDataURL(qrData.qrData, {

        width: 256,

        margin: 2,

        color: {

          dark: "#1a1a2e",

          light: "#ffffff",

        },

      }).then(setQrImageUrl)

    }

  }, [qrData?.qrData])



  useEffect(() => {

    if (!qrData) return



    const interval = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          setQrData(null)

          setQrImageUrl("")

          return 0

        }

        return prev - 1

      })

    }, 1000)



    return () => clearInterval(interval)

  }, [qrData])



  useEffect(() => {

    if (!sectionId) return



    const timer = setTimeout(() => void fetchAttendance(qrData?.sessionId), 0)
    const interval = setInterval(() => fetchAttendance(qrData?.sessionId), 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }

  }, [sectionId, qrData?.sessionId, fetchAttendance])



  const formatTime = (seconds: number) => {

    const mins = Math.floor(seconds / 60)

    const secs = seconds % 60

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

  }



  const filteredAttendance = attendanceList.filter((record) => {

    const fullName = `${record.student.firstName} ${record.student.lastName}`.toLowerCase()

    const studentCode = record.student.studentCode || ""

    return (

      fullName.includes(searchQuery.toLowerCase()) ||

      studentCode.includes(searchQuery)

    )

  })



  const totalEnrolled = section?._count?.enrollments || 0

  const registered = attendanceList.length

  const percentage = totalEnrolled > 0 ? Math.round((registered / totalEnrolled) * 100) : 0



  const getMethodIcon = (method: string) => {

    switch (method) {

      case "QR_SCAN":

        return "qr_code"

      case "MANUAL":

        return "edit"

      case "PROFESSOR_NOTE":

        return "note"

      default:

        return "help"

    }

  }



  const getMethodLabel = (method: string) => {

    switch (method) {

      case "QR_SCAN":

        return "QR Code"

      case "MANUAL":

        return "Manual"

      case "PROFESSOR_NOTE":

        return "Nota"

      default:

        return method

    }

  }



  if (noSectionId) {

    return (

      <AppShell>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-24">

          <span className="material-symbols-outlined mb-4 text-[64px] text-outline">error</span>

          <h3 className="text-xl font-semibold text-on-surface-variant">Sección no especificada</h3>

          <p className="mt-2 text-on-surface-variant">

            Por favor selecciona una asignatura desde Mis Asignaturas

          </p>

          <Link

            href="/subjects"

            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"

          >

            <span className="material-symbols-outlined">book</span>

            Ver Asignaturas

          </Link>

        </div>

      </AppShell>

    )

  }



  if (isLoading) {

    return (

      <AppShell>

        <div className="flex flex-col items-center justify-center py-24">

          <span className="animate-spin text-[64px] text-primary">progress_activity</span>

          <p className="mt-4 text-on-surface-variant">Cargando...</p>

        </div>

      </AppShell>

    )

  }



  if (error && !section) {

    return (

      <AppShell>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-error/50 bg-error-container/20 py-24">

          <span className="material-symbols-outlined mb-4 text-[64px] text-error">error</span>

          <h3 className="text-xl font-semibold text-error">Error</h3>

          <p className="mt-2 text-on-surface-variant">{error}</p>

          <Link

            href="/subjects"

            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"

          >

            Volver a Asignaturas

          </Link>

        </div>

      </AppShell>

    )

  }



  return (

    <AppShell>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div className="flex items-center gap-4">

          <div>

            <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-primary">

              {section?.course?.name || "Asistencia"}

            </h1>

            <p className="text-sm text-on-surface-variant">

              {section?.code} Â· {section?.schedule}

            </p>

          </div>

          {qrData && (

            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 animate-pulse">

              <span className="h-2 w-2 rounded-full bg-green-600" />

              Sesión activa

            </div>

          )}

        </div>

        <div className="flex items-center gap-4">

          <Link

            href="/subjects"

            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"

          >

            <span className="material-symbols-outlined text-xl">arrow_back</span>

            Volver a asignaturas

          </Link>

        </div>

      </div>



      {error && (

        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-container px-4 py-3 text-sm text-error">

          <span className="material-symbols-outlined text-lg">error</span>

          {error}

        </div>

      )}



      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        <div className="space-y-6 lg:col-span-4">

          <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">

            <div className="absolute top-0 left-0 h-1 w-full bg-primary/10" />

            <div className="flex flex-col items-center gap-6 py-6">

              {qrData && qrImageUrl ? (

                <div className="relative rounded-2xl border-2 border-primary/20 bg-surface-container-lowest p-4">

                  <div className="flex size-60 items-center justify-center bg-surface-container">

                    <Image src={qrImageUrl} alt="QR Code" width={224} height={224} className="rounded-lg" unoptimized />

                  </div>

                </div>

              ) : (

                <div className="relative rounded-2xl border-2 border-primary/20 bg-surface-container-lowest p-4">

                  <div className="flex size-60 items-center justify-center bg-surface-container">

                    <span className="material-symbols-outlined text-[120px] text-primary/40">

                      qr_code_2

                    </span>

                  </div>

                </div>

              )}

              <div className="space-y-2 text-center">

                <p className="text-sm font-medium text-on-surface-variant">

                  {qrData

                    ? "Escanea este código para registrar asistencia"

                    : "Genera un código QR para iniciar la sesión"}

                </p>

                {qrData && timeLeft > 0 && (

                  <div className="text-4xl font-bold tracking-tight text-primary">

                    {formatTime(timeLeft)}

                  </div>

                )}

                {qrData && timeLeft > 0 && (

                  <p className="text-xs text-outline">Tiempo restante para el cierre automático</p>

                )}

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 p-6 pt-0">

              <div className="rounded-lg bg-surface-container p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-outline">

                  Registrados

                </p>

                <p className="mt-1 text-2xl font-bold text-primary">

                  {registered}

                  <span className="text-lg font-medium text-on-surface-variant">

                    /{totalEnrolled}

                  </span>

                </p>

              </div>

              <div className="rounded-lg bg-surface-container p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-outline">

                  Porcentaje

                </p>

                <p className="mt-1 text-2xl font-bold text-primary">{percentage}%</p>

              </div>

            </div>

          </div>



          <div className="flex flex-col gap-3">

            {qrData ? (

              <>

                <button

                  onClick={closeSession}

                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-error py-4 font-bold text-white transition hover:opacity-90"

                >

                  <span className="material-symbols-outlined text-xl">close</span>

                  Cerrar Sesión

                </button>

                <button

                  onClick={isCameraActive ? stopCamera : startCamera}

                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-3 font-semibold text-primary transition hover:bg-primary/5"

                >

                  <span className="material-symbols-outlined text-xl">qr_code_scanner</span>

                  {isCameraActive ? "Detener cámara" : "Probar escaneo"}

                </button>

                <video ref={videoRef} className={isCameraActive ? "h-48 w-full rounded-lg bg-black object-cover" : "hidden"} muted playsInline />

                {scannerMessage && (

                  <p className="rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant">{scannerMessage}</p>

                )}

              </>

            ) : (

              <button

                onClick={generateQR}

                disabled={isGeneratingQR}

                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-bold text-on-primary transition hover:opacity-90 disabled:opacity-70"

              >

                {isGeneratingQR ? (

                  <>

                    <span className="animate-spin material-symbols-outlined">progress_activity</span>

                    Generando...

                  </>

                ) : (

                  <>

                    <span className="material-symbols-outlined text-xl">qr_code</span>

                    Generar Código QR

                  </>

                )}

              </button>

            )}

          </div>

        </div>



        <div className="lg:col-span-8">

          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">

            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">

              <h3 className="text-lg font-bold text-primary">Listado de Asistencia en Tiempo Real</h3>

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-xl text-outline">search</span>

                <input

                  type="text"

                  placeholder="Buscar alumno..."

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  className="w-48 border-none bg-transparent text-sm outline-none focus:ring-0"

                />

              </div>

            </div>

            <div className="flex-1 overflow-x-auto">

              {filteredAttendance.length > 0 ? (

                <table className="w-full text-left">

                  <thead className="border-b border-outline-variant bg-surface-container-low">

                    <tr>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-outline">

                        Matrícula

                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-outline">

                        Nombre

                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-outline">

                        Registro

                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-outline">

                        Método

                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-outline">

                        Estado

                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-outline-variant">

                    {filteredAttendance.map((record) => (

                      <tr

                        key={record.id}

                        className="transition-colors hover:bg-background"

                      >

                        <td className="px-6 py-4 text-sm font-medium text-primary">

                          {record.student.studentCode || record.studentId.substring(0, 8)}

                        </td>

                        <td className="px-6 py-4 text-sm text-on-surface">

                          {record.student.firstName} {record.student.lastName}

                        </td>

                        <td className="px-6 py-4 text-sm text-on-surface-variant">

                          {new Date(record.recordedAt).toLocaleTimeString("es-MX", {

                            hour: "2-digit",

                            minute: "2-digit",

                          })}

                        </td>

                        <td className="px-6 py-4 text-sm text-on-surface-variant">

                          <div className="flex items-center gap-1">

                            <span className="material-symbols-outlined text-lg">

                              {getMethodIcon(record.method)}

                            </span>

                            {getMethodLabel(record.method)}

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className={`status-badge-present`}>

                            {record.status === "PRESENT"

                              ? "Presente"

                              : record.status === "TARDY"

                              ? "Tarde"

                              : record.status === "ABSENT"

                              ? "Ausente"

                              : "Justificado"}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              ) : (

                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">

                  <span className="material-symbols-outlined text-[48px]">group_off</span>

                  <p className="mt-2">No hay registros de asistencia aún</p>

                  {qrData && <p className="text-sm">Los estudiantes pueden escanear el código QR para registrar su asistencia</p>}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </AppShell>

  )

}



export default function AttendancePage() {

  return (

    <Suspense fallback={

      <AppShell>

        <div className="flex flex-col items-center justify-center py-24">

          <span className="animate-spin text-[64px] text-primary">progress_activity</span>

          <p className="mt-4 text-on-surface-variant">Cargando...</p>

        </div>

      </AppShell>

    }>

      <AttendancePageContent />

    </Suspense>

  )

}