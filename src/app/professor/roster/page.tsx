"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { api, type Section, type RosterStudent } from "@/lib/api/client"

function RosterPageContent() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")

  const [section, setSection] = useState<Section | null>(null)
  const [roster, setRoster] = useState<RosterStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [professorName, setProfessorName] = useState("Dr. Alejandro Rossi")
  const [professorRole, setProfessorRole] = useState("Facultad de Ciencias")

  const mapRosterEntryToStudent = (entry: any): RosterStudent => ({
    id: entry.student?.id ?? entry.id,
    studentCode: entry.student?.studentCode ?? "",
    firstName: entry.student?.firstName ?? "",
    lastName: entry.student?.lastName ?? "",
    email: entry.student?.user?.email ?? "",
  })

  useEffect(() => {
    if (!sectionId) {
      setError("Sección no especificada")
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [sectionResult, rosterResult, profileResult] = await Promise.all([
          api.getSection(sectionId),
          api.getSectionRoster(sectionId),
          api.getProfessorProfile(),
        ])

        if (sectionResult.error) {
          setError(sectionResult.error)
        } else if (sectionResult.data) {
          setSection(sectionResult.data)
        }

        if (rosterResult.error) {
          setError(rosterResult.error)
        } else if (Array.isArray(rosterResult.data)) {
          setRoster(rosterResult.data.map(mapRosterEntryToStudent))
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
  }, [sectionId])

  if (isLoading) {
    return (
      <AppShell
        searchPlaceholder="Buscar asignaturas, estudiantes o recursos..."
        professorName={professorName}
        professorRole={professorRole}
      >
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando lista de estudiantes...</p>
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
          <Link
            href="/professor/subjects"
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"
          >
            Volver a Mis Asignaturas
          </Link>
        </div>
      </AppShell>
    )
  }

  if (!section) {
    return (
      <AppShell
        searchPlaceholder="Buscar asignaturas, estudiantes o recursos..."
        professorName={professorName}
        professorRole={professorRole}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-24">
          <span className="material-symbols-outlined mb-4 text-[64px] text-outline">error</span>
          <h3 className="text-xl font-semibold text-on-surface-variant">Sección no encontrada</h3>
          <Link
            href="/professor/subjects"
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"
          >
            Volver a Mis Asignaturas
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      searchPlaceholder="Buscar estudiantes..."
      professorName={professorName}
      professorRole={professorRole}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
            Lista de Estudiantes
          </h1>
          <p className="mt-1 text-base leading-[24px] text-on-surface-variant">
            {section.course?.name} - Sección {section.code} · {section.semester} {section.year}
          </p>
        </div>
        <Link
          href="/professor/subjects"
          className="flex items-center gap-2 rounded-lg border border-primary py-2 px-4 text-sm font-medium text-primary transition hover:bg-primary/5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver a Asignaturas
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="rounded-lg bg-primary-container px-4 py-3 text-sm text-on-primary-container">
          <span className="font-semibold">Total matriculados:</span> {roster?.length ?? 0}
        </div>
        <div className="rounded-lg bg-tertiary-container px-4 py-3 text-sm text-on-tertiary-container">
          <span className="font-semibold">Horario:</span> {section.schedule || "No definido"}
        </div>
        <div className="rounded-lg bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">
          <span className="font-semibold">Aula:</span> {section.room || "No definida"}
        </div>
      </div>

      { (roster?.length ?? 0) > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
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
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {roster?.map((student) => (
                <tr key={student.id} className="transition-colors hover:bg-background">
                  <td className="px-6 py-4 text-sm font-medium text-primary">
                    {student.studentCode || "Sin matrícula"}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {student.email || "Sin email"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-24">
          <span className="material-symbols-outlined mb-4 text-[64px] text-outline">group_off</span>
          <h3 className="text-xl font-semibold text-on-surface-variant">Sin estudiantes matriculados</h3>
          <p className="mt-2 text-on-surface-variant">No hay estudiantes inscritos en esta sección</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Link
          href={`/attendance?sectionId=${section.id}`}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary transition hover:opacity-90"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          Tomar Asistencia
        </Link>
        <Link
          href={`/reports?sectionId=${section.id}`}
          className="flex items-center gap-2 rounded-lg border border-primary px-6 py-3 font-medium text-primary transition hover:bg-primary/5"
        >
          <span className="material-symbols-outlined">assessment</span>
          Ver Reportes
        </Link>
      </div>
    </AppShell>
  )
}

export default function RosterPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AppShell>
    }>
      <RosterPageContent />
    </Suspense>
  )
}