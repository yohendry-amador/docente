"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { api, type Section } from "@/lib/api/client"

const accentHeader: Record<string, string> = {
  navy: "bg-primary-container",
  teal: "bg-on-secondary-container",
  amber: "bg-tertiary-container",
  mint: "bg-secondary-container",
}

const accentBadge: Record<string, string> = {
  navy: "bg-white/20 text-white",
  teal: "bg-white/20 text-white",
  amber: "bg-white/20 text-white",
  mint: "bg-white/40 text-on-secondary-container",
}

const accentColors = ["navy", "teal", "amber", "mint"]

export default function SubjectsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [professorName, setProfessorName] = useState("Dr. Alejandro Rossi")
  const [professorRole, setProfessorRole] = useState("Facultad de Ciencias")
  const [selectedPeriod, setSelectedPeriod] = useState("todos")
  const [selectedFaculty, setSelectedFaculty] = useState("todas")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectionsResult, profileResult] = await Promise.all([
          api.getMySections(),
          api.getProfessorProfile(),
        ])

        if (sectionsResult.data) {
          setSections(sectionsResult.data)
        }

        if (profileResult.data) {
          const prof = profileResult.data
          setProfessorName(`Prof. ${prof.firstName} ${prof.lastName}`)
          if (prof.department) {
            setProfessorRole(prof.department)
          }
        }
      } catch {
        setError("Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const uniquePeriods = useMemo(() => {
    const periods = new Set<string>()
    sections.forEach((s) => {
      if (s.semester && s.year) {
        periods.add(`${s.semester} ${s.year}`)
      }
    })
    return Array.from(periods).sort()
  }, [sections])

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (selectedPeriod !== "todos") {
        const periodStr = `${s.semester} ${s.year}`
        if (periodStr !== selectedPeriod) return false
      }
      return true
    })
  }, [sections, selectedPeriod])

  if (isLoading) {
    return (
      <AppShell
        searchPlaceholder="Buscar asignaturas, estudiantes o recursos..."
        professorName={professorName}
        professorRole={professorRole}
      >
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando asignaturas...</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell
        searchPlaceholder="Buscar asignaturas, estudiantes o recursos..."
        professorName={professorName}
        professorRole={professorRole}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-error/50 bg-error-container/20 py-24">
          <span className="material-symbols-outlined mb-4 text-[64px] text-error">error</span>
          <h3 className="text-xl font-semibold text-error">Error</h3>
          <p className="mt-2 text-on-surface-variant">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      searchPlaceholder="Buscar asignaturas, estudiantes o recursos..."
      professorName={professorName}
      professorRole={professorRole}
    >
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            Mis Asignaturas
          </h1>
          <p className="mt-1 text-base leading-[24px] text-on-surface-variant">
            Gestión académica para el ciclo lectivo actual
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant">
              Periodo Académico
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="todos">Todos los periodos</option>
              {uniquePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant">
              Facultad
            </span>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="todas">Todas las facultades</option>
            </select>
          </label>
        </div>
      </section>

      {filteredSections.length > 0 ? (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSections.map((section, index) => {
            const accent = accentColors[index % accentColors.length]
            return (
              <article
                key={section.id}
                className="subject-card-hover flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
              >
                <div className={`relative h-24 ${accentHeader[accent]}`}>
                  <span
                    className={`absolute bottom-4 left-4 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${accentBadge[accent]}`}
                  >
                    {section.course?.code || "Curso"}
                  </span>
                </div>
                <div className="flex-1 space-y-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold leading-[32px] text-on-surface">
                      {section.course?.name || "Sin nombre"}
                    </h3>
                    <p className="text-sm font-medium text-on-surface-variant">
                      Sección: {section.code} · {section.semester} {section.year}
                    </p>
                  </div>
                  <div className="space-y-3 text-on-surface-variant">
                    <p className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-xl">calendar_today</span>
                      {section.schedule || "Horario no definido"}
                    </p>
                    <p className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                      {section.room || "Ubicación no definida"}
                    </p>
                    <p className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-xl">groups</span>
                      {section._count?.enrollments || 0} Estudiantes matriculados
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
                  <Link
                    href={`/attendance?sectionId=${section.id}`}
                    className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-medium text-on-primary transition hover:opacity-90"
                  >
                    Asistencia
                  </Link>
                  <Link
                    href={`/professor/roster?sectionId=${section.id}`}
                    className="flex-1 rounded-lg border border-primary py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/5"
                  >
                    Ver Lista
                  </Link>
                  <Link
                    href={`/reports?sectionId=${section.id}`}
                    className="flex-1 rounded-lg border border-primary py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/5"
                  >
                    Ver Reportes
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-24">
          <span className="material-symbols-outlined mb-4 text-[64px] text-outline">school</span>
          <h3 className="text-xl font-semibold text-on-surface-variant">
            {selectedPeriod !== "todos" ? "Sin asignaturas en este periodo" : "Sin asignaturas"}
          </h3>
          <p className="mt-2 text-on-surface-variant">
            {selectedPeriod !== "todos"
              ? "Selecciona otro periodo académico para ver tus asignaturas"
              : "No tienes asignaturas asignadas para este periodo"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-primary-fixed p-6 lg:col-span-2">
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-primary/10">
            school
          </span>
          <div className="relative">
            <h3 className="text-xl font-semibold leading-[32px] text-on-primary-fixed">
              Resumen de Carga Horaria
            </h3>
            <p className="mt-2 max-w-md text-base leading-[24px] text-on-primary-fixed-variant">
              Usted tiene actualmente {sections.length} asignaturas asignadas
              para el periodo actual.
            </p>
            <div className="mt-8 flex gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-on-primary-fixed-variant/70">
                  Total Secciones
                </p>
                <p className="text-xl font-semibold leading-[32px] text-on-primary-fixed">
                  {sections.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-on-primary-fixed-variant/70">
                  Total Estudiantes
                </p>
                <p className="text-xl font-semibold leading-[32px] text-on-primary-fixed">
                  {sections?.reduce((sum, s) => sum + (s._count?.enrollments || 0), 0) ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-high p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-on-surface-variant">Próxima Clase</p>
            <h3 className="text-xl font-semibold leading-[32px] text-on-surface">
              {filteredSections[0]?.course?.name || "Sin asignaturas"}
            </h3>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">
                {filteredSections[0]?.schedule || "Sin horario"}
              </p>
              <p className="text-base font-bold text-on-surface">
                {filteredSections[0]?.room || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}