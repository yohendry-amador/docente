"use client"

import { useState, useEffect } from "react"
import { StudentShell } from "@/components/student-shell"
import { api, type StudentProfile } from "@/lib/api/client"

export default function StudentSubjectsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studentName, setStudentName] = useState("Estudiante")

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await api.getStudentProfile()
        if (result.data) {
          setProfile(result.data)
          setStudentName(`${result.data.firstName} ${result.data.lastName}`)
        }
      } catch (err) {
        console.error("Error loading subjects:", err)
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
        <h1 className="text-[28px] font-bold text-on-surface">Mis Asignaturas</h1>
        <p className="text-on-surface-variant">Cursos en los que estás inscrito</p>
      </section>

      {profile?.enrollments && profile.enrollments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profile.enrollments.map((enrollment) => (
            <div key={enrollment.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:border-primary hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {enrollment.section.course.name}
                </span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  enrollment.status === "ACTIVE" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"
                }`}>
                  {enrollment.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <span>{enrollment.section.professor.firstName} {enrollment.section.professor.lastName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>{enrollment.section.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined">room</span>
                  <span>{enrollment.section.room || "Sin aula asignada"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined">class</span>
                  <span>Sección: {enrollment.section.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-20">
          <span className="material-symbols-outlined text-[64px] text-outline">menu_book</span>
          <h3 className="mt-4 text-xl font-semibold text-on-surface-variant">Sin asignaturas</h3>
          <p className="mt-2 text-on-surface-variant">Contacta al administrador para inscribirte en cursos</p>
        </div>
      )}
    </StudentShell>
  )
}