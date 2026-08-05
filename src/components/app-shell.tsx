import type { ReactNode } from "react"
import { RoleSidebar } from "@/components/role-sidebar"
import { Topbar } from "@/components/topbar"

type AppShellProps = {
  children: ReactNode
  searchPlaceholder?: string
  topbarLeft?: ReactNode
  professorName?: string
  professorRole?: string
  userRole?: string | null
}

export function AppShell({
  children,
  searchPlaceholder,
  topbarLeft,
  professorName,
  professorRole,
  userRole,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar userName={professorName} userRole={userRole} />
      <div className="pl-64">
        <Topbar
          searchPlaceholder={searchPlaceholder}
          leftContent={topbarLeft}
          professorName={professorName}
          professorRole={professorRole}
        />
        <main className="mx-auto max-w-[1440px] p-8">{children}</main>
      </div>
    </div>
  )
}