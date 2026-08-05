"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api, type Course } from "@/lib/api/client"

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [adminName] = useState("Administrador")
  const [formData, setFormData] = useState({ code: "", name: "", description: "", credits: 3 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loadCourses = async () => {
    setIsLoading(true)
    const result = await api.getAllCourses()
    if (result.data) setCourses(result.data.courses)
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadCourses(), 0)
    return () => clearTimeout(timer)
  }, [])

  const openCreateModal = () => {
    setEditingCourse(null)
    setFormData({ code: "", name: "", description: "", credits: 3 })
    setShowModal(true)
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setFormData({ code: course.code, name: course.name, description: course.description || "", credits: course.credits || 3 })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, formData)
      } else {
        await api.createCourse(formData)
      }
      setShowModal(false)
      setEditingCourse(null)
      setFormData({ code: "", name: "", description: "", credits: 3 })
      await loadCourses()
    } catch (err) { console.error("Error saving course:", err) }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return
    try {
      await api.deleteCourse(id)
      await loadCourses()
    } catch (err) { console.error("Error deleting course:", err) }
  }

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface">Gestión de Cursos</h1>
          <p className="text-on-surface-variant">Crea y administra cursos</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition hover:opacity-90">
          <span className="material-symbols-outlined text-xl">add</span>
          Nuevo Curso
        </button>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><span className="animate-spin text-[48px] text-primary">EduPortal</span></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all hover:border-primary hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{course.code}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(course)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors" title="Editar">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="rounded-lg p-1.5 text-error hover:bg-error/10 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant">{course.credits} créditos</span>
              <h3 className="mb-2 text-lg font-bold text-on-surface">{course.name}</h3>
              <p className="text-sm text-on-surface-variant">{course.description || "Sin descripción"}</p>
            </div>
          ))}
        </div>
      )}

      {courses.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-20">
          <span className="material-symbols-outlined text-[48px] text-outline">book</span>
          <p className="mt-2 text-on-surface-variant">No hay cursos registrados</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-on-surface">{editingCourse ? "Editar Curso" : "Nuevo Curso"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Código</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface">Créditos</label>
                  <input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} required min="1" className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingCourse(null) }} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70">
                  {isSubmitting ? "Guardando..." : editingCourse ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}