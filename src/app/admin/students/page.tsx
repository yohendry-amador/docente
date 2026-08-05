"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api } from "@/lib/api/client"

type Student = {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  user: { email: string; isActive: boolean }
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [adminName] = useState("Administrador")
  const [search, setSearch] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "", studentCode: "", firstName: "", lastName: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    const result = await api.getAllStudents(undefined, undefined, search || undefined)
    if (result.data) setStudents(result.data.students)
    setIsLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => void loadStudents(), 0)
    return () => clearTimeout(timer)
  }, [loadStudents])

  const openCreateModal = () => {
    setEditingStudent(null)
    setFormData({ email: "", password: "", studentCode: "", firstName: "", lastName: "" })
    setShowModal(true)
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setFormData({ email: "", password: "", studentCode: student.studentCode, firstName: student.firstName, lastName: student.lastName })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, { studentCode: formData.studentCode, firstName: formData.firstName, lastName: formData.lastName })
      } else {
        await api.createStudent(formData)
      }
      setShowModal(false)
      setEditingStudent(null)
      setFormData({ email: "", password: "", studentCode: "", firstName: "", lastName: "" })
      await loadStudents()
    } catch (err) { console.error("Error saving student:", err) }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return
    try {
      await api.deleteStudent(id)
      await loadStudents()
    } catch (err) { console.error("Error deleting student:", err) }
  }

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface">Gestión de Estudiantes</h1>
          <p className="text-on-surface-variant">Administra estudiantes registrados</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition hover:opacity-90"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Nuevo Estudiante
        </button>
      </section>

      <div className="mb-4">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Buscar estudiantes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin text-[48px] text-primary">progress_activity</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Código</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-on-surface-variant">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-on-surface">{student.studentCode}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{student.user?.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${student.user?.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                      {student.user?.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEditModal(student)}
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="rounded-lg p-2 text-error hover:bg-error/10 transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">school</span>
              <p className="mt-2 text-on-surface-variant">No hay estudiantes registrados</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-on-surface">{editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingStudent ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-on-surface">Código</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      required
                      className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Nombre</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Apellido</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Código</label>
                      <input
                        type="text"
                        value={formData.studentCode}
                        onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Nombre</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">Apellido</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-on-surface">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingStudent(null) }} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70">
                  {isSubmitting ? "Guardando..." : editingStudent ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}