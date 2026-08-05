"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api/client"

const navItems = [
  { href: "/", label: "Inicio", icon: "dashboard" },
  { href: "/subjects", label: "Mis Asignaturas", icon: "book" },
  { href: "/attendance", label: "Asistencia", icon: "fact_check" },
  { href: "/reports", label: "Reportes", icon: "analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    api.logout()
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-10 px-4">
        <h1 className="text-2xl font-bold text-primary">EduPortal</h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Gestión Académica
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
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
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span>Configuración</span>
        </Link>
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