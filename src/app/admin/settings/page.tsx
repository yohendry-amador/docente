"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin-shell"
import { api } from "@/lib/api/client"

export default function AdminSettingsPage() {
  const [adminName, setAdminName] = useState("Administrador")
  const [systemInfo] = useState({
    version: "1.0.0",
    database: "PostgreSQL",
    lastBackup: "No registrado",
  })
  const [isLoading, setIsLoading] = useState(true)

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
      } catch (err) {
        console.error("Error loading admin data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <AdminShell adminName={adminName} userRole="ADMIN">
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell adminName={adminName} userRole="ADMIN">
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
          Configuración del Sistema
        </h1>
        <p className="mt-1 text-base leading-[24px] text-on-surface-variant">
          Gestiona la configuración general del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Información del Sistema</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Versión</p>
                  <p className="text-sm text-on-surface-variant">Versión actual del sistema</p>
                </div>
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {systemInfo.version}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Base de Datos</p>
                  <p className="text-sm text-on-surface-variant">Motor de base de datos</p>
                </div>
                <span className="text-sm text-on-surface-variant">{systemInfo.database}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Último Respaldo</p>
                  <p className="text-sm text-on-surface-variant">Fecha del último respaldo</p>
                </div>
                <span className="text-sm text-on-surface-variant">{systemInfo.lastBackup}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Configuración General</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Modo Mantenimiento</p>
                  <p className="text-sm text-on-surface-variant">Desactiva el sistema para usuarios</p>
                </div>
                <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-container opacity-50 cursor-not-allowed">
                  Desactivado
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Registro de Auditoría</p>
                  <p className="text-sm text-on-surface-variant">Historial de acciones del sistema</p>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:opacity-90">
                  Ver Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Cuenta de Administrador</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-on-surface-variant">Nombre</p>
                <p className="font-medium text-on-surface">{adminName}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Cambiar Contraseña</p>
                  <p className="text-sm text-on-surface-variant">Actualiza tu contraseña</p>
                </div>
                <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-container">
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-error/30 bg-error-container/20 ambient-shadow">
            <div className="border-b border-error/30 px-6 py-4">
              <h3 className="text-lg font-bold text-error">Zona de Peligro</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Cerrar Sesión</p>
                  <p className="text-sm text-on-surface-variant">Salir de la aplicación</p>
                </div>
                <button
                  onClick={() => api.logout()}
                  className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}