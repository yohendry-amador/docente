"use client"

import type { ReactNode } from "react"
import { RoleSidebar } from "@/components/role-sidebar"

type StudentShellProps = {
  children: ReactNode
  studentName?: string
}

export function StudentShell({ children, studentName = "Estudiante" }: StudentShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar userName={studentName} userRole="STUDENT" />
      <div className="pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center border-b border-outline-variant bg-surface px-8">
          <h2 className="text-lg font-bold text-on-surface">Portal Estudiantil</h2>
        </div>
        <main className="mx-auto max-w-[1440px] p-8">{children}</main>
      </div>
    </div>
  )
}