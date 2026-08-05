"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api, type AuditLog } from "@/lib/api/client"

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [adminName] = useState("Administrador")
  const limit = 20
  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    const result = await api.getAuditLogs(page, limit)
    if (result.data) {
      setLogs(result.data.logs)
      setTotal(result.data.total)
    }
    setIsLoading(false)
  }, [page])

  useEffect(() => {
    const timer = setTimeout(() => void loadLogs(), 0)
    return () => clearTimeout(timer)
  }, [loadLogs])

  const totalPages = Math.ceil(total / limit)

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <section className="mb-6">
        <h1 className="text-[28px] font-bold text-on-surface">Auditoría del Sistema</h1>
        <p className="text-on-surface-variant">Historial de acciones realizadas en el sistema</p>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><span className="animate-spin text-[48px] text-primary">progress_activity</span></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Acción</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">Entidad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-on-surface-variant">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("es-MX")}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">
                    <div>
                      <p className="font-medium">{log.user?.email || "Sistema"}</p>
                      <p className="text-xs text-on-surface-variant">{log.user?.role}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{log.entityType}</td>
                  <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{log.entityId?.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">history</span>
              <p className="mt-2 text-on-surface-variant">No hay registros de auditoría</p>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  )
}