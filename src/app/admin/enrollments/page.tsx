"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api, type EnrollmentStatus } from "@/lib/api/client"

type Option = { id: string; label: string }

type Enrollment = {
  id: string
  studentId: string
  sectionId: string
  status: EnrollmentStatus
  createdAt: string
  student: { id: string; studentCode: string; firstName: string; lastName: string; email: string }
  section: { id: string; code: string; course: { name: string; code: string }; professor: { firstName: string; lastName: string } }
}

export default function AdminEnrollmentsPage() {
  const [sections, setSections] = useState<Option[]>([])
  const [students, setStudents] = useState<Option[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Option | null>(null)
  const [studentHistory, setStudentHistory] = useState<Enrollment[]>([])
  const [adminName] = useState("Administrador")
  const [formData, setFormData] = useState({ studentId: "", sectionId: "" })
  const [moveData, setMoveData] = useState({ newSectionId: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [sectionFilter, setSectionFilter] = useState<string>("ALL")

  const loadData = async () => {
    setIsLoading(true)
    const [sectionsResult, studentsResult, enrollmentsResult] = await Promise.all([
      api.getAllSections(),
      api.getAllStudents(),
      Promise.resolve({ data: [] }),
    ])
    if (sectionsResult.data) setSections(sectionsResult.data.sections.map(s => ({ id: s.id, label: `${s.code} - ${s.course?.name} (${s.professor?.firstName} ${s.professor?.lastName})` })))
    if (studentsResult.data) setStudents(studentsResult.data.students.map(st => ({ id: st.id, label: `${st.studentCode} - ${st.firstName} ${st.lastName}` })))
    setIsLoading(false)
  }

  const loadEnrollments = async (sectionId?: string) => {
    if (!sectionId || sectionId === 'ALL') {
      const result = await api.getAllEnrollments()
      if (result.data) setEnrollments(result.data as Enrollment[])
      return
    }
    const result = await api.getAllSectionEnrollments(sectionId)
    if (result.data) setEnrollments(result.data as Enrollment[])
  }

  const loadStudentHistory = async (studentId: string) => {
    setIsHistoryLoading(true)
    const result = await api.getStudentEnrollmentHistory(studentId)
    if (result.data) setStudentHistory(result.data as Enrollment[])
    setIsHistoryLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadEnrollments(sectionFilter)
  }, [sectionFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.enrollStudent(formData)
      setShowModal(false)
      setFormData({ studentId: "", sectionId: "" })
      if (formData.sectionId) await loadEnrollments(formData.sectionId)
    } catch (err) { console.error("Error enrolling student:", err) }
    setIsSubmitting(false)
  }

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEnrollment) return
    setIsSubmitting(true)
    try {
      await api.moveEnrollment(selectedEnrollment.id, moveData.newSectionId)
      setShowMoveModal(false)
      setMoveData({ newSectionId: "" })
      await loadEnrollments(selectedEnrollment.sectionId)
    } catch (err) { console.error("Error moving student:", err) }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedEnrollment) return
    if (!confirm("¿Eliminar esta inscripción? El estudiante será removido de la sección.")) return
    try {
      await api.deleteEnrollment(selectedEnrollment.id)
      await loadEnrollments(selectedEnrollment.sectionId)
    } catch (err) { console.error("Error deleting enrollment:", err) }
  }

  const handleStatusChange = async (enrollment: Enrollment, newStatus: EnrollmentStatus) => {
    try {
      await api.updateEnrollment(enrollment.id, newStatus)
      await loadEnrollments(enrollment.sectionId)
    } catch (err) { console.error("Error updating status:", err) }
  }

  const displayedEnrollments = enrollments

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface">Gestión de Inscripciones</h1>
          <p className="text-on-surface-variant">Inscribe, mueve y gestiona estudiantes en secciones</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition hover:opacity-90">
          <span className="material-symbols-outlined text-xl">add</span>
          Nueva Inscripción
        </button>
      </section>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <label className="mb-2 block text-sm font-semibold text-on-surface-variant">Filtrar por sección</label>
        <select value={sectionFilter} onChange={(e) => { const val = e.target.value; setSectionFilter(val); if (val !== "ALL") loadEnrollments(val); else loadEnrollments("ALL"); }} className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">
          <option value="ALL">Todas las secciones</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><span className="animate-spin text-[48px] text-primary">Eduportal</span></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Estudiante</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Sección</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-on-surface-variant">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {displayedEnrollments.length > 0 ? (
                displayedEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-on-surface">{enrollment.student.firstName} {enrollment.student.lastName}</div>
                      <div className="text-xs text-on-surface-variant">{enrollment.student.studentCode} · {enrollment.student.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {enrollment.section?.course?.name ?? '—'} - Sección {enrollment.section?.code ?? ''}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={enrollment.status}
                        onChange={(e) => handleStatusChange(enrollment, e.target.value as EnrollmentStatus)}
                        className="rounded-lg border border-outline-variant bg-surface-container py-1.5 px-3 text-sm outline-none focus:border-primary"
                      >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="DROPPED">Retirado</option>
                        <option value="COMPLETED">Completado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(enrollment.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedStudent({ id: enrollment.studentId, label: enrollment.student.firstName + " " + enrollment.student.lastName }); loadStudentHistory(enrollment.studentId); setShowHistoryModal(true) }}
                          className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                          title="Ver historial"
                        >
                          <span className="material-symbols-outlined text-base">history</span>
                        </button>
                        <button
                          onClick={() => { setSelectedEnrollment(enrollment); setShowMoveModal(true) }}
                          className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                          title="Cambiar sección"
                        >
                          <span className="material-symbols-outlined text-base">swap_horiz</span>
                        </button>
                        <button
                          onClick={() => { setSelectedEnrollment(enrollment); handleDelete() }}
                          className="inline-flex items-center gap-2 rounded-lg border border-error px-3 py-2 text-xs font-semibold text-error transition hover:bg-error/5"
                          title="Eliminar inscripción"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No hay inscripciones en esta sección</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-on-surface">Nueva Inscripción</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Estudiante</label>
                <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">
                  <option value="">Seleccionar estudiante...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Sección</label>
                <select value={formData.sectionId} onChange={(e) => { setFormData({ ...formData, sectionId: e.target.value }); loadEnrollments(e.target.value) }} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">
                  <option value="">Seleccionar sección...</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70">
                  {isSubmitting ? "Inscribiendo..." : "Inscribir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Historial de Inscripciones</h2>
                <p className="text-sm text-on-surface-variant">{selectedStudent?.label}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="rounded-lg p-2 hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-12"><span className="animate-spin text-[40px] text-primary">progress_activity</span></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-outline-variant bg-surface-container-low">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Curso</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Sección</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Profesor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {studentHistory.map((h) => (
                      <tr key={h.id}>
                        <td className="px-4 py-3 text-sm text-on-surface">{h.section?.course?.name ?? '—'} ({h.section?.course?.code ?? ''})</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{h.section?.code ?? ''}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{h.section?.professor?.firstName ?? ''} {h.section?.professor?.lastName ?? ''}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${h.status === "ACTIVE" ? "bg-green-100 text-green-800" : h.status === "DROPPED" ? "bg-red-100 text-red-800" : h.status === "COMPLETED" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{new Date(h.createdAt).toLocaleDateString("es-ES")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-on-surface">Cambiar Sección</h2>
            <p className="mb-4 text-sm text-on-surface-variant">Mover a <strong>{selectedEnrollment?.student.firstName} {selectedEnrollment?.student.lastName}</strong> a otra sección</p>
            <form onSubmit={handleMove} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Nueva Sección</label>
                <select value={moveData.newSectionId} onChange={(e) => setMoveData({ newSectionId: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">
                  <option value="">Seleccionar sección...</option>
                  {sections.filter(s => s.id !== selectedEnrollment?.sectionId).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowMoveModal(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70">
                  {isSubmitting ? "Moviendo..." : "Mover"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}