"use client"



import { useState, useEffect } from "react"

import { AdminShell } from "@/components/admin-shell"

import { api, type Section, type Course, type SectionSummary, type EnrollmentStatus } from "@/lib/api/client"



type SectionWithDetails = Section & {

  course: Course

  professor: { id: string; firstName: string; lastName: string; employeeCode: string }

}



type Option = { id: string; label: string }

type SectionEnrollment = { id: string; student: { id: string; studentCode: string; firstName: string; lastName: string }; status: EnrollmentStatus }



export default function AdminSectionsPage() {

  const [sections, setSections] = useState<SectionWithDetails[]>([])

  const [courses, setCourses] = useState<Option[]>([])

  const [professors, setProfessors] = useState<Option[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)

  const [selectedSection, setSelectedSection] = useState<SectionWithDetails | null>(null)

  const [sectionSummary, setSectionSummary] = useState<SectionSummary | null>(null)

  const [sectionEnrollments, setSectionEnrollments] = useState<SectionEnrollment[]>([])

  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [detailError, setDetailError] = useState("")

  const [adminName] = useState("Administrador")

  const [formData, setFormData] = useState({

    code: "", courseId: "", professorId: "", schedule: "", room: "", semester: "", year: new Date().getFullYear()

  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {

    setIsLoading(true)

    const [sectionsResult, coursesResult, professorsResult] = await Promise.all([

      api.getAllSections(),

      api.getAllCourses(),

      api.getAllProfessors(),

    ])

    if (sectionsResult.data) setSections(sectionsResult.data.sections as SectionWithDetails[])

    if (coursesResult.data) setCourses(coursesResult.data.courses.map(c => ({ id: c.id, label: `${c.code} - ${c.name}` })))

    if (professorsResult.data) setProfessors(professorsResult.data.professors.map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName} (${p.employeeCode})` })))

    setIsLoading(false)

  }

  const openEditModal = (section: SectionWithDetails) => {
    setSelectedSection(section)
    setFormData({
      code: section.code,
      courseId: section.courseId,
      professorId: section.professorId,
      schedule: section.schedule,
      room: section.room,
      semester: section.semester,
      year: section.year,
    })
    setIsEditMode(true)
    setShowModal(true)
  }

  const handleDeleteSection = async (id: string, code: string) => {
    if (!confirm("Eliminar la seccion " + code + "? Esta accion no se puede deshacer.")) return
    try {
      await api.deleteSection(id)
      await loadData()
    } catch (err) {
      console.error("Error deleting section:", err)
      alert("Error al eliminar la seccion")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSection) return
    setIsSubmitting(true)
    try {
      await api.updateSection(selectedSection.id, formData)
      setShowModal(false)
      setIsEditMode(false)
      setFormData({ code: "", courseId: "", professorId: "", schedule: "", room: "", semester: "", year: new Date().getFullYear() })
      await loadData()
    } catch (err) { console.error("Error updating section:", err) }
    setIsSubmitting(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadData(), 0)
    return () => clearTimeout(timer)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {

    e.preventDefault()

    setIsSubmitting(true)

    try {

      await api.createSection(formData)

      setShowModal(false)

      setFormData({ code: "", courseId: "", professorId: "", schedule: "", room: "", semester: "", year: new Date().getFullYear() })

      await loadData()

    } catch (err) { console.error("Error creating section:", err) }

    setIsSubmitting(false)

  }



  const openSectionDetails = async (section: SectionWithDetails) => {

    setSelectedSection(section)

    setSectionSummary(null)

    setSectionEnrollments([])

    setDetailError("")

    setIsDetailLoading(true)



    const [summaryResult, enrollmentsResult] = await Promise.all([

      api.getSectionSummary(section.id),

      api.getSectionEnrollments(section.id),

    ])



    if (summaryResult.data) setSectionSummary(summaryResult.data)

    if (enrollmentsResult.data) setSectionEnrollments(enrollmentsResult.data as SectionEnrollment[])

    if (summaryResult.error || enrollmentsResult.error) {

      setDetailError(summaryResult.error || enrollmentsResult.error || "No se pudo cargar la informacion de la seccion")

    }

    setIsDetailLoading(false)

  }



  return (

    <AdminShell adminName={adminName} userRole="ADMIN">

      <section className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-[28px] font-bold text-on-surface">Gestión de Secciones</h1>

          <p className="text-on-surface-variant">Crea secciones y asigna profesores</p>

        </div>

        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition hover:opacity-90">

          <span className="material-symbols-outlined text-xl">add</span>

          Nueva Sección

        </button>

      </section>



      {isLoading ? (

        <div className="flex items-center justify-center py-20"><span className="animate-spin text-[48px] text-primary">progress_activity</span></div>

      ) : (

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">

          <table className="w-full">

            <thead>

              <tr className="border-b border-outline-variant bg-surface-container-low">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Código</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Curso</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Profesor</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Horario</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Aula</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Semestre</th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-on-surface-variant">Acciones</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-outline-variant">

              {sections.map((section) => (

                <tr key={section.id} className="hover:bg-surface-container transition-colors">

                  <td className="px-6 py-4 text-sm font-mono text-on-surface">{section.code}</td>

                  <td className="px-6 py-4 text-sm text-on-surface">{section.course?.name}</td>

                  <td className="px-6 py-4 text-sm text-on-surface">

                    <span className="flex items-center gap-2">

                      <span className="material-symbols-outlined text-primary">person</span>

                      {section.professor?.firstName} {section.professor?.lastName}

                    </span>

                  </td>

                  <td className="px-6 py-4 text-sm text-on-surface-variant">{section.schedule}</td>

                  <td className="px-6 py-4 text-sm text-on-surface-variant">{section.room}</td>

                  <td className="px-6 py-4 text-sm text-on-surface-variant">{section.semester} {section.year}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openSectionDetails(section)}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(section)}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                        title="Editar seccion"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id, section.code)}
                        className="inline-flex items-center gap-2 rounded-lg border border-error px-3 py-2 text-xs font-semibold text-error transition hover:bg-error/5"
                        title="Eliminar seccion"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {sections.length === 0 && (

            <div className="py-12 text-center">

              <span className="material-symbols-outlined text-[48px] text-outline">class</span>

              <p className="mt-2 text-on-surface-variant">No hay secciones registradas</p>

            </div>

          )}

        </div>

      )}



      {selectedSection && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-surface-container-lowest p-6 shadow-lg">

            <div className="mb-5 flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold text-on-surface">{selectedSection.course?.name}</h2>

                <p className="text-sm text-on-surface-variant">

                  Seccion {selectedSection.code} - {selectedSection.semester} {selectedSection.year}

                </p>

              </div>

              <button onClick={() => setSelectedSection(null)} className="rounded-lg p-2 hover:bg-surface-container">

                <span className="material-symbols-outlined">close</span>

              </button>

            </div>



            {isDetailLoading ? (

              <div className="flex items-center justify-center py-12"><span className="animate-spin text-[40px] text-primary">progress_activity</span></div>

            ) : detailError ? (

              <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-error">{detailError}</div>

            ) : (

              <div className="space-y-6">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <div className="rounded-lg bg-surface-container p-4">

                    <p className="text-xs font-semibold uppercase text-on-surface-variant">Profesor</p>

                    <p className="mt-1 text-sm font-bold text-on-surface">{selectedSection.professor?.firstName} {selectedSection.professor?.lastName}</p>

                  </div>

                  <div className="rounded-lg bg-surface-container p-4">

                    <p className="text-xs font-semibold uppercase text-on-surface-variant">Horario</p>

                    <p className="mt-1 text-sm font-bold text-on-surface">{selectedSection.schedule}</p>

                  </div>

                  <div className="rounded-lg bg-surface-container p-4">

                    <p className="text-xs font-semibold uppercase text-on-surface-variant">Aula</p>

                    <p className="mt-1 text-sm font-bold text-on-surface">{selectedSection.room}</p>

                  </div>

                </div>



                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

                  <div className="rounded-lg border border-outline-variant p-4">

                    <p className="text-xs text-on-surface-variant">Inscritos</p>

                    <p className="text-2xl font-bold text-primary">{sectionSummary?.totalEnrolled || 0}</p>

                  </div>

                  <div className="rounded-lg border border-outline-variant p-4">

                    <p className="text-xs text-on-surface-variant">Registros</p>

                    <p className="text-2xl font-bold text-primary">{sectionSummary?.totalAttendanceRecords || 0}</p>

                  </div>

                  <div className="rounded-lg border border-outline-variant p-4">

                    <p className="text-xs text-on-surface-variant">Presentes</p>

                    <p className="text-2xl font-bold text-green-600">{sectionSummary?.presentCount || 0}</p>

                  </div>

                  <div className="rounded-lg border border-outline-variant p-4">

                    <p className="text-xs text-on-surface-variant">Tardes</p>

                    <p className="text-2xl font-bold text-amber-600">{sectionSummary?.tardyCount || 0}</p>

                  </div>

                  <div className="rounded-lg border border-outline-variant p-4">

                    <p className="text-xs text-on-surface-variant">Ausentes</p>

                    <p className="text-2xl font-bold text-red-600">{sectionSummary?.absentCount || 0}</p>

                  </div>

                </div>



                <div>

                  <h3 className="mb-3 text-sm font-bold uppercase text-on-surface-variant">Estudiantes inscritos</h3>

                  <div className="overflow-hidden rounded-lg border border-outline-variant">

                    <table className="w-full">

                      <thead className="bg-surface-container-low">

                        <tr>

                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Codigo</th>

                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Nombre</th>

                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Estado</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-outline-variant">

                        {sectionEnrollments.map((enrollment) => (

                          <tr key={enrollment.id}>

                            <td className="px-4 py-3 text-sm font-mono text-on-surface">{enrollment.student.studentCode}</td>

                            <td className="px-4 py-3 text-sm text-on-surface">{enrollment.student.firstName} {enrollment.student.lastName}</td>

                            <td className="px-4 py-3 text-sm text-on-surface-variant">{enrollment.status}</td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                    {sectionEnrollments.length === 0 && <p className="px-4 py-8 text-center text-sm text-on-surface-variant">No hay estudiantes inscritos</p>}

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}



      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">

            <h2 className="mb-4 text-xl font-bold text-on-surface">Nueva Sección</h2>

            <form onSubmit={handleCreate} className="space-y-4">

              <div>

                <label className="mb-1 block text-sm font-medium text-on-surface">Curso</label>

                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">

                  <option value="">Seleccionar curso...</option>

                  {courses.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}

                </select>

              </div>

              <div>

                <label className="mb-1 block text-sm font-medium text-on-surface">Código de Sección</label>

                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="Ej: A, B, C" className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />

              </div>

              <div>

                <label className="mb-1 block text-sm font-medium text-on-surface">Profesor Asignado</label>

                <select value={formData.professorId} onChange={(e) => setFormData({ ...formData, professorId: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary">

                  <option value="">Seleccionar profesor...</option>

                  {professors.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}

                </select>

              </div>

              <div>

                <label className="mb-1 block text-sm font-medium text-on-surface">Horario</label>

                <input type="text" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} required placeholder="Ej: Lun-Mié-Vie 10:00-12:00" className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-1 block text-sm font-medium text-on-surface">Aula</label>

                  <input type="text" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-on-surface">Semestre</label>

                  <input type="text" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} required placeholder="Ej: 2026-1" className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />

                </div>

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container">Cancelar</button>

                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70">

                  {isSubmitting ? "Creando..." : "Crear"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </AdminShell>

  )

}