"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api, type User } from "@/lib/api/client"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [adminName] = useState("Administrador")
  const [formData, setFormData] = useState({ email: "", isActive: true })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loadUsers = async () => {
    setIsLoading(true)
    const result = await api.getAllUsers()
    if (result.data) setUsers(result.data.users)
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadUsers(), 0)
    return () => clearTimeout(timer)
  }, [])

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({ email: user.email, isActive: user.isActive })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.updateUser(editingUser!.id, formData)
      setShowModal(false)
      setEditingUser(null)
      await loadUsers()
    } catch (err) {
      console.error("Error updating user:", err)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return
    try {
      await api.deleteUser(id)
      await loadUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
    }
  }

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface">Gestión de Usuarios</h1>
          <p className="text-on-surface-variant">Administra cuentas de usuarios del sistema</p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin text-[48px] text-primary">progress_activity</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Fecha Creación</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      user.role === "ADMIN" ? "bg-primary/10 text-primary" :
                      user.role === "PROFESSOR" ? "bg-secondary/10 text-secondary" :
                      "bg-tertiary/10 text-tertiary"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      user.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    }`}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(user.createdAt).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
          {users.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">group_off</span>
              <p className="mt-2 text-on-surface-variant">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-on-surface">Editar Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface">Estado</label>
                <select
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container py-2.5 px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingUser(null) }}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-70"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}