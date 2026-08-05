"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { api, type Section } from "@/lib/api/client"

interface DashboardStats {
  totalStudents: number
  averageAttendance: number
  classesToday: number
}

interface RecentActivity {
  id: string
  studentName: string
  subjectName: string
  action: string
  date: string
  status: "pendiente" | "presente" | "urgente"
}

export default function DashboardPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    averageAttendance: 0,
    classesToday: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [professorName, setProfessorName] = useState("Dr. Profesor")
  const [professorRole, setProfessorRole] = useState("Profesor")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResult, sectionsResult] = await Promise.all([
          api.getProfessorProfile(),
          api.getMySections(),
        ])

        if (profileResult.data) {
          const prof = profileResult.data
          setProfessorName(`Dr. ${prof.lastName}`)
          setProfessorRole(prof.department || "Facultad de Ciencias")
        }

        if (sectionsResult.data) {
          setSections(sectionsResult.data)
          const totalStudents = sectionsResult.data?.reduce(
            (sum, s) => sum + (s._count?.enrollments || 0),
            0
          ) ?? 0
          setStats((prev) => ({
            ...prev,
            totalStudents,
            classesToday: sectionsResult.data!.length,
          }))
        }

        const allAttendances: RecentActivity[] = []
        for (const section of sectionsResult.data || []) {
          try {
            const reportResult = await api.getAttendanceReport({ sectionId: section.id })
            if (reportResult.data?.attendances) {
              reportResult.data.attendances.slice(0, 3).forEach((att) => {
                allAttendances.push({
                  id: att.id,
                  studentName: `${att.student.firstName} ${att.student.lastName}`,
                  subjectName: section.course?.name || "Sin materia",
                  action: att.status === "PRESENT" ? "Marcó Asistencia" : "Asistencia registrada",
                  date: new Date(att.recordedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  status: att.status === "PRESENT" ? "presente" : "pendiente",
                })
              })
            }
          } catch (e) {
            console.error(`Error loading attendance for section ${section.id}:`, e)
          }
        }

        const sortedActivity = allAttendances
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
        setRecentActivity(sortedActivity)

        if (sortedActivity.length > 0) {
          const presentCount = sortedActivity.filter((a) => a.status === "presente").length
          const avgAtt = Math.round((presentCount / sortedActivity.length) * 100)
          setStats((prev) => ({ ...prev, averageAttendance: avgAtt || 85 }))
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <AppShell professorName={professorName} professorRole={professorRole}>
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AppShell>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
  })

  return (
    <AppShell professorName={professorName} professorRole={professorRole}>
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-surface">
            Buenos días, {professorName}
          </h1>
          <p className="mt-1 text-lg leading-[28px] text-on-surface-variant">
            Aquí tienes un resumen de tus actividades para hoy, {formattedDate}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/professor/subjects"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition hover:opacity-90"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Nueva Clase
          </Link>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span className="material-symbols-outlined text-xl text-secondary">group</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">
            Alumnos totales
          </p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {stats.totalStudents}
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2">
              <span className="material-symbols-outlined text-xl text-primary">analytics</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">
            Asistencia promedio
          </p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {stats.averageAttendance}%
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ambient-shadow">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-tertiary-container/20 p-2">
              <span className="material-symbols-outlined text-xl text-on-tertiary-container">schedule</span>
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-on-surface-variant">
            Clases hoy
          </p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            {stats.classesToday}
          </p>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {sections[0] ? (
            <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-xl bg-primary-container p-8">
              <div>
                <span className="mb-6 inline-block rounded-full bg-on-primary-container/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-primary-container">
                  PRÓXIMA CLASE
                </span>
                <h2 className="mb-2 text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-primary">
                  {sections[0].course?.name}
                </h2>
                <p className="text-lg leading-[28px] text-on-primary-container/80">
                  {sections[0].code} · {sections[0].room || "Sin aula"} · {sections[0].schedule}
                </p>
                <div className="mt-8 flex flex-wrap gap-6">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-symbols-outlined text-xl">person</span>
                    {sections[0]._count?.enrollments || 0} Alumnos inscritos
                  </span>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <Link
                  href={`/professor/attendance?sectionId=${sections[0].id}`}
                  className="flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-primary transition hover:bg-white/90"
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Iniciar Asistencia
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest">
              <span className="material-symbols-outlined text-[64px] text-outline">school</span>
              <h3 className="mt-4 text-xl font-semibold text-on-surface-variant">Sin asignaturas</h3>
              <p className="mt-2 text-on-surface-variant">Contacta al administrador para asignar materias</p>
              <Link
                href="/professor/subjects"
                className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"
              >
                Ver Asignaturas
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Total de Secciones
              </h4>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-on-surface">{sections.length}</span>
                  <p className="text-sm text-on-surface-variant">Asignaturas activas</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <span className="material-symbols-outlined text-xl text-primary">book</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Estudiantes Totales
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-on-surface">{stats.totalStudents}</span>
                  <p className="text-sm text-on-surface-variant">En todas las secciones</p>
                </div>
                <div className="rounded-full bg-secondary-container/30 p-3">
                  <span className="material-symbols-outlined text-xl text-on-secondary-container">groups</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-5">
              <h4 className="text-sm font-bold text-on-surface">Actividad Reciente</h4>
              <Link href="/professor/reports" className="cursor-pointer text-sm font-medium text-primary hover:underline">
                Ver todo
              </Link>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-outline-variant">
                {recentActivity.map((row) => (
                  <div key={row.id} className="flex gap-4 p-4 transition-colors hover:bg-surface-container">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(row.studentName)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{row.studentName}</p>
                      <p className="text-xs text-on-surface-variant">{row.action} - {row.subjectName}</p>
                      <p className="text-xs text-outline">{row.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] text-outline">history</span>
                <p className="mt-2 text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>

          {sections.length > 0 && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
              <h4 className="mb-4 text-sm font-bold text-on-surface">Tus Secciones</h4>
              <div className="space-y-3">
                {sections.slice(0, 4).map((section) => (
                  <Link
                    key={section.id}
                    href={`/attendance?sectionId=${section.id}`}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-surface-container"
                  >
                    <div>
                      <p className="text-sm font-medium text-on-surface">{section.course?.name}</p>
                      <p className="text-xs text-on-surface-variant">{section.code}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">chevron_right</span>
                  </Link>
                ))}
              </div>
              {sections.length > 4 && (
                <Link
                  href="/professor/subjects"
                  className="mt-3 flex items-center justify-center text-sm font-medium text-primary hover:underline"
                >
                  Ver todas las secciones
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  )
}