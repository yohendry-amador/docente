"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api/client"

type NavItem = { href: string; label: string; icon: string }

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: "dashboard" },
  { href: "/admin/users", label: "Usuarios", icon: "manage_accounts" },
  { href: "/admin/students", label: "Estudiantes", icon: "school" },
  { href: "/admin/professors", label: "Profesores", icon: "psychology" },
  { href: "/admin/courses", label: "Cursos", icon: "book" },
  { href: "/admin/sections", label: "Secciones", icon: "class" },
  { href: "/admin/enrollments", label: "Inscripciones", icon: "assignment" },
  { href: "/admin/audit", label: "Auditoría", icon: "history" },
]

const professorNavItems: NavItem[] = [
  { href: "/professor", label: "Inicio", icon: "dashboard" },
  { href: "/professor/subjects", label: "Mis Secciones", icon: "book" },
  { href: "/professor/attendance", label: "Asistencia", icon: "fact_check" },
  { href: "/professor/reports", label: "Reportes", icon: "analytics" },
]

const studentNavItems: NavItem[] = [
  { href: "/student", label: "Inicio", icon: "dashboard" },
  { href: "/student/scan", label: "Escanear QR", icon: "qr_code_scanner" },
  { href: "/student/subjects", label: "Mis Asignaturas", icon: "menu_book" },
  { href: "/student/attendance", label: "Mi Asistencia", icon: "event_available" },
]

function getNavItems(role?: string | null): NavItem[] {
  const normalizedRole = role?.toUpperCase()
  if (normalizedRole === "ADMIN") return adminNavItems
  if (normalizedRole === "STUDENT") return studentNavItems
  return professorNavItems
}

function getRoleDisplayName(role?: string | null): string {
  const normalizedRole = role?.toUpperCase()
  if (normalizedRole === "ADMIN") return "Administrador"
  if (normalizedRole === "STUDENT") return "Estudiante"
  return "Profesor"
}

function getAppName(role?: string | null): { name: string; subtitle: string } {
  const normalizedRole = role?.toUpperCase()
  if (normalizedRole === "ADMIN") return { name: "EduPortal", subtitle: "Panel de Administración" }
  if (normalizedRole === "STUDENT") return { name: "EduPortal", subtitle: "Portal Estudiantil" }
  return { name: "EduPortal", subtitle: "Gestión de Asistencia" }
}

type RoleSidebarProps = {
  userName?: string
  userRole?: string | null
}

export function RoleSidebar({ userName, userRole }: RoleSidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(userRole)
  const appInfo = getAppName(userRole)

  const handleLogout = () => {
    api.logout()
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-10 px-4">
        <h1 className="text-2xl font-bold text-primary">{appInfo.name}</h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {appInfo.subtitle}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin" || item.href === "/professor" || item.href === "/student"
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                isActive
                  ? "bg-surface-container font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-on-surface">{userName || "Usuario"}</p>
          <p className="text-xs text-on-surface-variant">{getRoleDisplayName(userRole)}</p>
        </div>
        {userRole?.toUpperCase() === "PROFESSOR" && (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Configuración</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}