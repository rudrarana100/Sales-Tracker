import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, Phone, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { getFollowUps } from "@/features/leads/api/followUpsApi";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const followUps = await getFollowUps();
        const today = new Date().toISOString().split("T")[0];

        const overdueItems = followUps
          .filter((f) => f.scheduled_date < today && f.status === "pending")
          .map((f) => ({
            id: `overdue_${f.id}`,
            title: `Overdue Follow-up: ${f.leads?.lead_name || "Lead"}`,
            subtitle: `Due ${f.scheduled_date}`,
            type: "urgent",
            time: "Action required",
          }));

        const todayItems = followUps
          .filter((f) => f.scheduled_date === today && f.status === "pending")
          .map((f) => ({
            id: `today_${f.id}`,
            title: `Follow-up Scheduled: ${f.leads?.lead_name || "Lead"}`,
            subtitle: `Scheduled at ${f.scheduled_time || "Today"}`,
            type: "info",
            time: f.scheduled_time || "Today",
          }));

        setNotifications([...overdueItems, ...todayItems]);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-scale-in">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
              {unreadCount} New
            </span>
          </div>

          <div className="mt-2 max-h-72 overflow-y-auto space-y-1.5 sidebar-scroll">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No new notifications. You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    n.type === "urgent"
                      ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40 text-slate-800 dark:text-slate-200"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {n.type === "urgent" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <Calendar className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
