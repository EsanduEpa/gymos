"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications"

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<{ notifications: any[]; unreadCount: number }>({
    notifications: [],
    unreadCount: 0,
  })

  const loadNotifications = async () => {
    const res = await getUserNotifications()
    setData(res)
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id)
      loadNotifications()
    }
    setOpen(false)
    if (notif.linkUrl) {
      router.push(notif.linkUrl)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    loadNotifications()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[#8B8E98] hover:text-[#171B28] hover:bg-gray-100 relative transition-colors"
      >
        <Bell className="h-5 w-5" />
        {data.unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
            {data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#E1E1E4] shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[#E1E1E4] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="text-xs font-bold text-[#171B28]">Notifications</h3>
              {data.unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-[#007A35] font-semibold flex items-center gap-1 hover:underline"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#E1E1E4]">
              {data.notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8B8E98]">No notifications yet.</div>
              ) : (
                data.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 text-xs cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notif.isRead ? "bg-emerald-50/40 font-medium" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#171B28] text-[11px]">{notif.title}</p>
                      <span className="text-[9px] text-[#8B8E98]">{new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-[11px] text-[#8B8E98] mt-0.5">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
