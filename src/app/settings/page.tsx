"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { api, type Professor } from "@/lib/api/client"

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    attendanceAlert: true,
    weeklyReport: false,
  })
  const [profile, setProfile] = useState<Partial<Professor>>({})
  const [profileEmail, setProfileEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [professorName, setProfessorName] = useState("Profesor")
  const [professorRole, setProfessorRole] = useState("Facultad")
  const [theme, setTheme] = useState<"claro" | "oscuro" | "sistema">("claro")

  useEffect(() => {
    const checkUserRoleAndRedirect = () => {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === "ADMIN") {
          router.replace("/admin/settings")
          return
        }
      }
    }
    checkUserRoleAndRedirect()
  }, [router])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await api.getProfessorProfile()
        if (result.data) {
          const prof = result.data
          setProfile({
            firstName: prof.firstName,
            lastName: prof.lastName,
            department: prof.department,
            employeeCode: prof.employeeCode,
          })
          setProfileEmail(prof.user?.email || "")
          setProfessorName(`Prof. ${prof.lastName}`)
          setProfessorRole(prof.department || "Facultad de Ciencias")
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setSaveMessage("")

    try {
      const result = await api.updateProfessorProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      })

      if (result.error) {
        setSaveMessage("Error al guardar: " + result.error)
      } else {
        setSaveMessage("Cambios guardados correctamente")
        if (result.data) {
          setProfessorName(`Prof. ${result.data.lastName}`)
          setProfessorRole(result.data.department || "Facultad de Ciencias")
        }
      }
    } catch {
      setSaveMessage("Error al guardar los cambios")
    }

    setIsSaving(false)
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    try {
      const result = await api.changePassword({
        currentPassword,
        newPassword,
      })

      if (result.error) {
        setPasswordError(result.error)
      } else {
        setPasswordSuccess("Contraseña actualizada correctamente")
        setShowPasswordModal(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setPasswordError("Error al cambiar la contraseña")
    }
    setIsChangingPassword(false)
  }

  const handleLogout = () => {
    api.logout()
  }

  const getInitials = () => {
    const first = profile.firstName?.[0] || "P"
    const last = profile.lastName?.[0] || " "
    return `${first}${last}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <AppShell searchPlaceholder="Buscar configuración..." professorName={professorName} professorRole={professorRole}>
        <div className="flex flex-col items-center justify-center py-24">
          <span className="animate-spin text-[64px] text-primary">progress_activity</span>
          <p className="mt-4 text-on-surface-variant">Cargando...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell searchPlaceholder="Buscar configuración..." professorName={professorName} professorRole={professorRole}>
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-on-surface">
          Configuración
        </h1>
        <p className="mt-1 text-base leading-[24px] text-on-surface-variant">
          Gestiona tu cuenta y preferencias.
        </p>
      </div>

      {saveMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">
            {saveMessage.includes("Error") ? "error" : "check_circle"}
          </span>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Información Personal</h3>
            </div>
            <div className="p-6">
              <div className="mb-6 flex items-center gap-6">
                <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {getInitials()}
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Foto de perfil</p>
                  <button className="mt-2 text-sm font-medium text-primary hover:underline">
                    Cambiar foto
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profile.firstName || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={profile.lastName || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-sm text-on-surface-variant"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={profile.department || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Código de Empleado
                  </label>
                  <input
                    type="text"
                    value={profile.employeeCode || ""}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-sm text-on-surface-variant"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-70"
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Seguridad</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Cambiar contraseña</p>
                  <p className="text-sm text-on-surface-variant">Actualiza tu contraseña de acceso</p>
                  {passwordSuccess && !showPasswordModal && (
                    <p className="mt-1 text-xs text-green-700">{passwordSuccess}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(true)
                    setPasswordError("")
                    setPasswordSuccess("")
                  }}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-container"
                >
                  Cambiar
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Autenticación de dos factores</p>
                  <p className="text-sm text-on-surface-variant">Añade una capa extra de seguridad</p>
                </div>
                <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-container opacity-50 cursor-not-allowed">
                  Próximamente
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Notificaciones</h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-on-surface">Notificaciones por correo</p>
                  <p className="text-sm text-on-surface-variant">Recibe actualizaciones por email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange("email")}
                  className="size-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-on-surface">Notificaciones push</p>
                  <p className="text-sm text-on-surface-variant">Alertas en tiempo real</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange("push")}
                  className="size-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-on-surface">Alertas de asistencia</p>
                  <p className="text-sm text-on-surface-variant">Cuando un alumno falta</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.attendanceAlert}
                  onChange={() => handleNotificationChange("attendanceAlert")}
                  className="size-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-on-surface">Reporte semanal</p>
                  <p className="text-sm text-on-surface-variant">Resumen de actividades</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={() => handleNotificationChange("weeklyReport")}
                  className="size-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="text-lg font-bold text-on-surface">Apariencia</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-on-surface">Tema</p>
                <p className="text-sm text-on-surface-variant mb-2">Selecciona el tema de la aplicación</p>
                <div className="flex gap-2">
                  {(["claro", "oscuro", "sistema"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                        theme === t
                          ? "border-primary bg-surface-container-lowest text-primary"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {t === "claro" ? "Claro" : t === "oscuro" ? "Oscuro" : "Sistema"}
                    </button>
                  ))}
                </div>
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
                  <p className="font-medium text-on-surface">Cerrar todas las sesiones</p>
                  <p className="text-sm text-on-surface-variant">Desconectar todos los dispositivos</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-error/50 px-4 py-2 text-sm font-medium text-error transition hover:bg-error-container"
                >
                  Cerrar sesiones
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">Cerrar sesión</p>
                  <p className="text-sm text-on-surface-variant">Salir de la aplicación</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-on-surface">Cambiar Contraseña</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-container px-3 py-2 text-sm text-error">
                <span className="material-symbols-outlined text-lg">error</span>
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary-container px-3 py-2 text-sm text-on-secondary-container">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 rounded-lg border border-outline-variant py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-70"
              >
                {isChangingPassword ? "Cambiando..." : "Cambiar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}