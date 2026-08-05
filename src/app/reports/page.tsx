"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { api, type AttendanceReport, type Section, type ReportAttendanceItem } from "@/lib/api/client"

const statusStyles: Record<string, string> = {
  PRESENT: "bg-secondary-container text-on-secondary-container",
  TARDY: "bg-amber-100 text-amber-800",
  ABSENT: "bg-error-container text-on-error-container",
  JUSTIFIED: "bg-primary/10 text-primary",
}

const statusLabels: Record<string, string> = {
  PRESENT: "Presente",
  TARDY: "Tarde",
  ABSENT: "Faltó",
  JUSTIFIED: "Justificado",
}

function ReportsPageContent() {
  const searchParams = useSearchParams()
  const initialSectionId = searchParams.get("sectionId")

  const [sections, setSections] = useState<Section[]>([])
  const [selectedSubject, setSelectedSubject] = useState(initialSectionId || "")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showData, setShowData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<AttendanceReport | null>(null)
  const [error, setError] = useState("")
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  useEffect(() => {
    const loadSections = async () => {
      try {
        const result = await api.getMySections()
        if (result.data) {
          setSections(result.data)
          if (initialSectionId) {
            setSelectedSubject(initialSectionId)
          }
        }
      } catch (err) {
        console.error("Error loading sections:", err)
      }
    }
    loadSections()
  }, [initialSectionId])

  const handleApplyFilters = async () => {
    if (!selectedSubject) {
      setError("Por favor selecciona una materia")
      return
    }

    setIsLoading(true)
    setError("")
    setShowData(false)

    try {
      const result = await api.getAttendanceReport({
        sectionId: selectedSubject,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        setReportData(result.data)
        setShowData(true)
      }
    } catch {
      setError("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const getSectionName = () => {
    if (!selectedSubject) return "Reporte"
    const section = sections.find((s) => s.id === selectedSubject)
    return section ? `${section.course?.name} - ${section.code}` : "Reporte"
  }

  const exportToCSV = () => {
    if (!reportData?.attendances) return
    setIsExportingExcel(true)

    const headers = "Nombre,Materia,Fecha,Estado,Método\n"
    const rows = reportData.attendances
      .map((row) => {
        const name = `${row.student.firstName} ${row.student.lastName}`
        const subject = row.section.course.name
        const date = new Date(row.recordedAt).toLocaleDateString("es-MX")
        const status = statusLabels[row.status]
        const method = row.method === "QR_SCAN" ? "QR" : row.method === "MANUAL" ? "Manual" : "Nota"
        return [name, subject, date, status, method].join(",")
      })
      .join("\n")

    const blob = new Blob(["<200b>", headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-asistencia-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setIsExportingExcel(false)
  }

  const exportToPDF = () => {
    setIsExportingPDF(true)

    const sectionName = getSectionName()
    const date = new Date().toLocaleDateString("es-MX")

    const html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte de Asistencia</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f0f0f5; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #666; }
        td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
        .stats { display: flex; gap: 24px; margin: 20px 0; }
        .stat-item { background: #f5f5fa; padding: 12px 16px; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
        .badge-presente { background: #dbeafe; color: #2563eb; }
        .badge-tarde { background: #fef3c7; color: #d97706; }
        .badge-ausente { background: #fee2e2; color: #dc2626; }
        .badge-justificado { background: #e0e7ff; color: #4f46e5; }
      </style>
    </head>
    <body>
      <h1>Reporte de Asistencia</h1>
      <p class="subtitle">${sectionName} · ${date}</p>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${reportData?.stats?.present || 0}</div>
          <div class="stat-label">Presentes</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${reportData?.stats?.absent || 0}</div>
          <div class="stat-label">Ausentes</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${reportData?.stats?.tardy || 0}</div>
          <div class="stat-label">Tarde</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${reportData?.stats?.total || 0}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Nombre</th><th>Materia</th><th>Fecha</th><th>Estado</th><th>Método</th></tr></thead>
        <tbody>
          ${(reportData?.attendances || [])
            .map((row) => {
              const name = `${row.student.firstName} ${row.student.lastName}`
              const subject = row.section.course.name
              const recordDate = new Date(row.recordedAt).toLocaleDateString("es-MX")
              const statusClass = `badge-${statusLabels[row.status].toLowerCase()}`
              const status = statusLabels[row.status]
              const method = row.method === "QR_SCAN" ? "QR" : row.method === "MANUAL" ? "Manual" : "Nota"
              return `<tr><td>${name}</td><td>${subject}</td><td>${recordDate}</td><td><span class="badge ${statusClass}">${status}</span></td><td>${method}</td></tr>`
            })
            .join("")}
        </tbody>
      </table>
    </body>
    </html>`

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
    setIsExportingPDF(false)
  }

  const maxPresent = reportData?.stats
    ? Math.max(
        reportData.stats.present,
        reportData.stats.absent,
        reportData.stats.tardy,
        reportData.stats.justified
      )
    : 100

  return (
    <AppShell searchPlaceholder="Buscar analíticas...">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            Reportes y Analíticas
          </h1>
          <p className="mt-1 text-base leading-[24px] text-on-surface-variant">
            Monitorea tendencias de asistencia y exporta registros académicos.
          </p>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 ambient-shadow">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Materia</label>
          <select
            className="min-w-[180px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Seleccionar materia</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.course?.name} - {section.code}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface-variant">Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-70"
        >
          {isLoading ? "Cargando..." : "Aplicar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-container px-4 py-3 text-sm text-error">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {!showData && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-24 opacity-80">
          <span className="material-symbols-outlined mb-4 text-[64px] text-outline">analytics</span>
          <h3 className="text-xl font-semibold text-on-surface-variant">Sin Datos Cargados</h3>
          <p className="mt-2 text-on-surface-variant">
            Selecciona una materia y haz clic en Aplicar para ver los reportes.
          </p>
        </div>
      )}

      {showData && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-4">
              <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Asistencia Promedio
                  </p>
                  <h2 className="mt-1 text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-primary">
                    {reportData.stats.total > 0
                      ? Math.round((reportData.stats.present / reportData.stats.total) * 100)
                      : 0}%
                  </h2>
                  <p className="mt-2 flex items-center gap-1 text-sm font-medium text-secondary">
                    <span className="material-symbols-outlined text-lg">trending_up</span>
                    Según registros
                  </p>
                </div>
                <div className="rounded-full bg-secondary-container p-3">
                  <span className="material-symbols-outlined text-xl text-on-secondary-container">groups</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Total Registros
                  </p>
                  <h2 className="mt-1 text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-primary">
                    {reportData.stats.total}
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">En el periodo seleccionado</p>
                </div>
                <div className="rounded-full bg-primary-container p-3">
                  <span className="material-symbols-outlined text-xl text-on-primary-container">fact_check</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow lg:col-span-8">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-xl font-semibold leading-[32px] text-on-surface">
                  Distribución de Estados
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-secondary-container" />
                    <span className="text-sm text-on-surface-variant">Presentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="text-sm text-on-surface-variant">Tarde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-error-container" />
                    <span className="text-sm text-on-surface-variant">Ausentes</span>
                  </div>
                </div>
              </div>
              <div className="flex h-48 items-end justify-around gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-sm bg-secondary-container transition-opacity hover:opacity-80"
                    style={{ height: `${maxPresent ? (reportData.stats.present / maxPresent) * 100 : 0}%` }}
                  />
                  <span className="text-sm text-on-surface-variant">P: {reportData.stats.present}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-sm bg-amber-400 transition-opacity hover:opacity-80"
                    style={{ height: `${maxPresent ? (reportData.stats.tardy / maxPresent) * 100 : 0}%` }}
                  />
                  <span className="text-sm text-on-surface-variant">T: {reportData.stats.tardy}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-sm bg-error-container transition-opacity hover:opacity-80"
                    style={{ height: `${maxPresent ? (reportData.stats.absent / maxPresent) * 100 : 0}%` }}
                  />
                  <span className="text-sm text-on-surface-variant">A: {reportData.stats.absent}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-t-sm bg-primary/20 transition-opacity hover:opacity-80"
                    style={{ height: `${maxPresent ? (reportData.stats.justified / maxPresent) * 100 : 0}%` }}
                  />
                  <span className="text-sm text-on-surface-variant">J: {reportData.stats.justified}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xl font-semibold leading-[32px] text-on-surface">
              Registro Detallado de Asistencia
            </h3>
            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-container disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                {isExportingPDF ? "Exportando..." : "Exportar PDF"}
              </button>
              <button
                onClick={exportToCSV}
                disabled={isExportingExcel}
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-secondary transition hover:bg-surface-container disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">table_chart</span>
                {isExportingExcel ? "Exportando..." : "Exportar Excel"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Método
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {reportData.attendances.length > 0 ? (
                  reportData.attendances.map((row: ReportAttendanceItem) => (
                    <tr key={row.id} className="transition-colors hover:bg-background">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {row.section.course.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(row.recordedAt).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}>
                          {statusLabels[row.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {row.method === "QR_SCAN" ? "QR" : row.method === "MANUAL" ? "Manual" : "Nota"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                      No hay registros de asistencia en el periodo seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <AppShell searchPlaceholder="Buscar analíticas...">
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AppShell>
    }>
      <ReportsPageContent />
    </Suspense>
  )
}