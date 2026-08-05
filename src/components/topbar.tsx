"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { api, type Notification } from "@/lib/api/client"

type TopbarProps = {
  searchPlaceholder?: string
  leftContent?: ReactNode
  professorName?: string
  professorRole?: string
  onSearch?: (query: string) => void
}

export function Topbar({
  searchPlaceholder = "Buscar alumnos, clases o archivos...",
  leftContent,
  professorName = "Dr. Martínez",
  professorRole = "Profesor Senior",
  onSearch,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const loadNotifications = async () => {
    const [notifResult, countResult] = await Promise.all([
      api.getNotifications(),
      api.getUnreadNotificationCount(),
    ])
    if (notifResult.data) {
      setNotifications(notifResult.data.slice(0, 10))
    }
    if (countResult.data) {
      setUnreadCount(countResult.data.count)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadNotifications(), 0)
    const interval = setInterval(loadNotifications, 30000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      if (value.trim() && onSearch) {
        onSearch(value.trim())
      }
    }, 400) as unknown as ReturnType<typeof setTimeout>
  }

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsAsRead()
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const timeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ahora"
    if (mins < 60) return `Hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `Hace ${hrs}h`
    return `Hace ${Math.floor(hrs / 24)}d`
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-8">
      <div className="flex flex-1 items-center">
        {leftContent ?? (
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() && onSearch) {
                  onSearch(searchQuery.trim())
                }
              }}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <div ref={dropdownRef} className="relative">
            <button
              aria-label="Notificaciones"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative cursor-pointer transition-opacity hover:opacity-80"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-surface bg-error text-[8px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg">
                <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
                  <h4 className="text-sm font-bold text-on-surface">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Marcar todas leídas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface-container ${
                          !n.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined mt-0.5 text-lg ${
                            n.type === "ATTENDANCE" ? "text-amber-500" : "text-primary"
                          }`}
                        >
                          {n.type === "ATTENDANCE" ? "warning" : "info"}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface">{n.title}</p>
                          <p className="text-xs text-on-surface-variant">{n.message}</p>
                          <p className="mt-1 text-[10px] text-outline">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="mt-1.5 size-2 rounded-full bg-primary" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <span className="material-symbols-outlined text-3xl text-outline">notifications_off</span>
                      <p className="mt-2 text-xs text-on-surface-variant">Sin notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/settings"
            aria-label="Ayuda y configuración"
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <span className="material-symbols-outlined text-xl">help</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-on-surface">{professorName}</p>
            <p className="text-xs font-semibold text-on-surface-variant">
              {professorRole}
            </p>
          </div>
          <Image
            src="/professor-avatar.png"
            alt={`Foto de ${professorName}`}
            width={40}
            height={40}
            className="size-10 rounded-full border border-outline-variant object-cover"
          />
        </div>
      </div>
    </header>
  )
}