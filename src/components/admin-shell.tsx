"use client"

import type { ReactNode } from "react"
import { RoleSidebar } from "@/components/role-sidebar"
import { Topbar } from "@/components/topbar"

type AdminShellProps = {
  children: ReactNode
  adminName?: string
  userRole?: string | null
}

export function AdminShell({ children, adminName = "Administrador", userRole }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar userName={adminName} userRole={userRole} />
      <div className="pl-64">
        <Topbar
          searchPlaceholder="Buscar en el sistema..."
          professorName={adminName}
          professorRole="Administrador"
        />
        <main className="mx-auto max-w-[1440px] p-8">{children}</main>
      </div>
    </div>
  )
}