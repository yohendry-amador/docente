"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api, type AttendanceReport } from "@/lib/api/client"

export default function AdminReportsPage() {
  const [report, setReport] = useState<AttendanceReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adminName] = useState("Administrador")

  const loadReport = async () => {
    setIsLoading(true)
    const result = await api.getAttendanceReport({})
    if (result.data) setReport(result.data)
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadReport(), 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6">
        <h1 className="text-[28px] font-bold text-on-surface">Reportes de Asistencia</h1>
        <p className="text-on-surface-variant">Resumen general de asistencia del sistema</p>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><span className="animate-spin text-[48px] text-primary">progress_activity</span></div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Total Registros</p>
              <p className="text-[28px] font-semibold text-on-surface">{report?.stats.total || 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Presentes</p>
              <p className="text-[28px] font-semibold text-green-600">{report?.stats.present || 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Ausentes</p>
              <p className="text-[28px] font-semibold text-red-600">{report?.stats.absent || 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Tardanzas</p>
              <p className="text-[28px] font-semibold text-amber-600">{report?.stats.tardy || 0}</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <p className="mb-1 text-xs font-medium text-on-surface-variant">Justificados</p>
              <p className="text-[28px] font-semibold text-blue-600">{report?.stats.justified || 0}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Estudiante</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Sección</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {report?.attendances.slice(0, 50).map((att) => (
                  <tr key={att.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4 text-sm text-on-surface">{att.student.firstName} {att.student.lastName}</td>
                    <td className="px-6 py-4 text-sm text-on-surface">{att.section.code} - {att.section.course.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(att.recordedAt).toLocaleString("es-MX")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        att.status === "PRESENT" ? "bg-green-500/10 text-green-600" :
                        att.status === "ABSENT" ? "bg-red-500/10 text-red-600" :
                        att.status === "TARDY" ? "bg-amber-500/10 text-amber-600" :
                        "bg-blue-500/10 text-blue-600"
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{att.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  )
}