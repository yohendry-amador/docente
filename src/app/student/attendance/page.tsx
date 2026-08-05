"use client"

import { useState, useEffect } from "react"
import { StudentShell } from "@/components/student-shell"
import { api, type StudentAttendanceSummary } from "@/lib/api/client"

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studentName, setStudentName] = useState("Estudiante")

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileResult = await api.getStudentProfile()
        if (profileResult.data) {
          setStudentName(`${profileResult.data.firstName} ${profileResult.data.lastName}`)
        }
        const summaryResult = await api.getStudentAttendanceSummary()
        if (summaryResult.data) setSummary(summaryResult.data)
      } catch (err) {
        console.error("Error loading attendance:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <StudentShell studentName={studentName}>
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </StudentShell>
    )
  }

  const groupedBySubject = summary?.attendances?.reduce((acc, att) => {
    const courseName = att.section.course.name
    if (!acc[courseName]) acc[courseName] = []
    acc[courseName].push(att)
    return acc
  }, {} as Record<string, typeof summary.attendances>) || {}

  return (
    <StudentShell studentName={studentName}>
      <section className="mb-6">
        <h1 className="text-[28px] font-bold text-on-surface">Mi Asistencia</h1>
        <p className="text-on-surface-variant">Historial completo de tu asistencia</p>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
          <p className="text-xs font-medium text-on-surface-variant">Tasa de Asistencia</p>
          <p className="text-2xl font-bold text-primary">{summary?.attendanceRate?.toFixed(1) || 0}%</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
          <p className="text-xs font-medium text-on-surface-variant">Presentes</p>
          <p className="text-2xl font-bold text-green-600">{summary?.present || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
          <p className="text-xs font-medium text-on-surface-variant">Ausentes</p>
          <p className="text-2xl font-bold text-red-600">{summary?.absent || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
          <p className="text-xs font-medium text-on-surface-variant">Tardanzas</p>
          <p className="text-2xl font-bold text-amber-600">{summary?.tardy || 0}</p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedBySubject).map(([courseName, attendances]) => (
          <div key={courseName} className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
            <div className="border-b border-outline-variant bg-surface-container-low p-4">
              <h3 className="font-bold text-on-surface">{courseName}</h3>
              <p className="text-sm text-on-surface-variant">
                {attendances.filter(a => a.status === "PRESENT").length} / {attendances.length} presentes
              </p>
            </div>
            <div className="divide-y divide-outline-variant">
              {attendances.map((att) => (
                <div key={att.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${
                      att.status === "PRESENT" ? "text-green-600" :
                      att.status === "ABSENT" ? "text-red-600" :
                      att.status === "TARDY" ? "text-amber-600" :
                      "text-blue-600"
                    }`}>
                      {att.status === "PRESENT" ? "check_circle" :
                       att.status === "ABSENT" ? "cancel" :
                       att.status === "TARDY" ? "schedule" : "done"}
                    </span>
                    <div>
                      <p className="text-sm text-on-surface">
                        {new Date(att.recordedAt).toLocaleDateString("es-MX", {
                          weekday: "long", day: "numeric", month: "long"
                        })}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(att.recordedAt).toLocaleTimeString("es-MX", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    att.status === "PRESENT" ? "bg-green-500/10 text-green-600" :
                    att.status === "ABSENT" ? "bg-red-500/10 text-red-600" :
                    att.status === "TARDY" ? "bg-amber-500/10 text-amber-600" :
                    "bg-blue-500/10 text-blue-600"
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {summary?.attendances.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-20">
          <span className="material-symbols-outlined text-[64px] text-outline">event_busy</span>
          <h3 className="mt-4 text-xl font-semibold text-on-surface-variant">Sin registros</h3>
          <p className="mt-2 text-on-surface-variant">Aún no tienes registros de asistencia</p>
        </div>
      )}
    </StudentShell>
  )
}