"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { StudentShell } from "@/components/student-shell"
import { api, type StudentProfile, type StudentAttendanceSummary } from "@/lib/api/client"

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [attendanceSummary, setAttendanceSummary] = useState<StudentAttendanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studentName, setStudentName] = useState("Estudiante")

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileResult = await api.getStudentProfile()
        if (profileResult.data) {
          setProfile(profileResult.data)
          setStudentName(`${profileResult.data.firstName} ${profileResult.data.lastName}`)
        }
        const summaryResult = await api.getStudentAttendanceSummary()
        if (summaryResult.data) setAttendanceSummary(summaryResult.data)
      } catch (err) {
        console.error("Error loading student data:", err)
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

  return (
    <StudentShell studentName={studentName}>
      <section className="mb-6">
        <h1 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-surface">
          Bienvenido, {profile?.firstName}
        </h1>
        <p className="mt-1 text-lg text-on-surface-variant">
          Código: {profile?.studentCode}
        </p>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span className="material-symbols-outlined text-xl text-secondary">menu_book</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">Asignaturas Inscritas</p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {profile?.enrollments?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-green-500/10 p-2">
              <span className="material-symbols-outlined text-xl text-green-600">check_circle</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">Asistencia Total</p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {attendanceSummary?.attendanceRate?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2">
              <span className="material-symbols-outlined text-xl text-primary">event_available</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">Registros de Asistencia</p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {attendanceSummary?.total || 0}
          </p>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h3 className="mb-4 text-sm font-bold text-on-surface">ACCIONES RÁPIDAS</h3>
          <div className="space-y-3">
            <Link
              href="/student/scan"
              className="flex items-center gap-3 rounded-lg border border-outline-variant bg-primary-container p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <span className="material-symbols-outlined text-2xl text-primary">qr_code_scanner</span>
              <div>
                <p className="font-bold text-on-primary-container">Escanear QR</p>
                <p className="text-sm text-on-primary-container/70">Registra tu asistencia</p>
              </div>
            </Link>
            <Link
              href="/student/subjects"
              className="flex items-center gap-3 rounded-lg border border-outline-variant p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <span className="material-symbols-outlined text-2xl text-secondary">menu_book</span>
              <div>
                <p className="font-bold text-on-surface">Mis Asignaturas</p>
                <p className="text-sm text-on-surface-variant">Ver cursos inscritos</p>
              </div>
            </Link>
            <Link
              href="/student/attendance"
              className="flex items-center gap-3 rounded-lg border border-outline-variant p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <span className="material-symbols-outlined text-2xl text-tertiary">event_available</span>
              <div>
                <p className="font-bold text-on-surface">Mi Asistencia</p>
                <p className="text-sm text-on-surface-variant">Ver historial completo</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h3 className="mb-4 text-sm font-bold text-on-surface">RESUMEN DE ASISTENCIA</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="flex items-center gap-2 text-sm text-on-surface">
                <span className="size-2 rounded-full bg-green-500"></span>
                Presentes
              </span>
              <span className="font-bold text-green-600">{attendanceSummary?.present || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="flex items-center gap-2 text-sm text-on-surface">
                <span className="size-2 rounded-full bg-red-500"></span>
                Ausentes
              </span>
              <span className="font-bold text-red-600">{attendanceSummary?.absent || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="flex items-center gap-2 text-sm text-on-surface">
                <span className="size-2 rounded-full bg-amber-500"></span>
                Tardanzas
              </span>
              <span className="font-bold text-amber-600">{attendanceSummary?.tardy || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="flex items-center gap-2 text-sm text-on-surface">
                <span className="size-2 rounded-full bg-blue-500"></span>
                Justificados
              </span>
              <span className="font-bold text-blue-600">{attendanceSummary?.justified || 0}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h3 className="mb-4 text-sm font-bold text-on-surface">MIS ASIGNATURAS</h3>
        {profile?.enrollments && profile.enrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profile.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-lg border border-outline-variant bg-surface-container p-4">
                <p className="text-xs font-semibold text-primary">{enrollment.section.course.name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {enrollment.section.professor.firstName} {enrollment.section.professor.lastName}
                </p>
                <p className="text-xs text-on-surface-variant">{enrollment.section.schedule}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">menu_book</span>
            <p className="mt-3 text-on-surface-variant">No tienes asignaturas inscritas</p>
            <p className="text-sm text-on-surface-variant">Contacta al administrador para inscribirte en cursos</p>
          </div>
        )}
      </section>
    </StudentShell>
  )
}