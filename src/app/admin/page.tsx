"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { api, type AdminStats } from "@/lib/api/client"

interface QuickAction {
  title: string
  description: string
  href: string
  icon: string
  color: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminName, setAdminName] = useState("Administrador")

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const userData = JSON.parse(userStr)
          if (userData.email) {
            const emailName = userData.email.split("@")[0]
            setAdminName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
          }
        }
        const result = await api.getAdminStats()
        if (result.data) setStats(result.data)
      } catch (err) {
        console.error("Error loading admin stats:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const quickActions: QuickAction[] = [
    {
      title: "Gestionar Usuarios",
      description: "Crear y administrar cuentas de usuarios",
      href: "/admin/users",
      icon: "manage_accounts",
      color: "bg-primary-container text-on-primary-container",
    },
    {
      title: "Gestionar Estudiantes",
      description: "Administrar estudiantes registrados",
      href: "/admin/students",
      icon: "school",
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      title: "Gestionar Profesores",
      description: "Administrar profesores y asignaciones",
      href: "/admin/professors",
      icon: "psychology",
      color: "bg-tertiary-container text-on-tertiary-container",
    },
    {
      title: "Gestionar Cursos",
      description: "Crear y editar cursos",
      href: "/admin/courses",
      icon: "book",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Gestionar Secciones",
      description: "Administrar secciones y asignar profesores",
      href: "/admin/sections",
      icon: "class",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Inscripciones",
      description: "Inscribir estudiantes en secciones",
      href: "/admin/enrollments",
      icon: "assignment",
      color: "bg-tertiary/10 text-tertiary",
    },
    {
      title: "Reportes",
      description: "Ver reportes de asistencia",
      href: "/admin/reports",
      icon: "analytics",
      color: "bg-primary-container/50 text-on-primary-container",
    },
    {
      title: "Auditoría",
      description: "Ver logs del sistema",
      href: "/admin/audit",
      icon: "history",
      color: "bg-surface-container text-on-surface",
    },
  ]

  if (isLoading) {
    return (
      <AdminShell adminName={adminName} userRole="ADMIN">
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary"></span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-surface">
            Panel de Administración
          </h1>
          <p className="mt-1 text-lg leading-[28px] text-on-surface-variant">
            Gestiona usuarios, cursos y configuraciones del sistema
          </p>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">group</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Total Usuarios</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalUsers || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span className="material-symbols-outlined text-lg text-secondary">school</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Estudiantes</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalStudents || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-tertiary/10 p-2">
              <span className="material-symbols-outlined text-lg text-tertiary">psychology</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Profesores</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalProfessors || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2">
              <span className="material-symbols-outlined text-lg text-primary">book</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Cursos</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalCourses || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-secondary/10 p-2">
              <span className="material-symbols-outlined text-lg text-secondary">class</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Secciones</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalSections || 0}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ambient-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-lg bg-tertiary/10 p-2">
              <span className="material-symbols-outlined text-lg text-tertiary">assignment</span>
            </div>
          </div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">Inscripciones</p>
          <p className="text-[28px] font-semibold tracking-[-0.01em] text-on-surface">{stats?.totalEnrollments || 0}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-on-surface">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className={`mb-3 inline-flex w-fit rounded-lg p-2 ${action.color}`}>
                <span className="material-symbols-outlined text-xl">{action.icon}</span>
              </div>
              <h3 className="mb-1 text-sm font-bold text-on-surface group-hover:text-primary">
                {action.title}
              </h3>
              <p className="text-xs text-on-surface-variant">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}