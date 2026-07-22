import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Phone, CalendarDays, KanbanSquare, Settings,
  ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Leads", icon: Users, path: "/leads" },
  { title: "Call Session", icon: Phone, path: "/call-session" },
  { title: "Follow-ups", icon: CalendarDays, path: "/follow-ups" },
  { title: "Pipeline", icon: KanbanSquare, path: "/pipeline" },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`flex flex-col border-r border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* App Header */}
      <div className="flex h-16 items-center border-b border-slate-100 dark:border-slate-800/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
            <Sparkles className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className={`transition-all duration-200 ${collapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
            <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">SalesTracker</h1>
            <p className="text-[10px] font-medium text-slate-400 leading-tight">Outbound CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sidebar-scroll">
        {!collapsed && (
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
        )}
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex h-9.5 items-center rounded-xl text-xs font-semibold transition-all duration-150",
                  collapsed ? "justify-center px-0 mx-auto w-9.5" : "gap-3 px-3",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
                ].join(" ")
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <span className={`transition-all duration-200 ${collapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"}`}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 p-2 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex h-9 items-center rounded-xl text-xs font-semibold transition-all duration-150",
              collapsed ? "justify-center px-0 mx-auto w-9" : "gap-3 px-3",
              isActive
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
            ].join(" ")
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="shrink-0" />
          <span className={`transition-all duration-200 ${collapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"}`}>
            Settings
          </span>
        </NavLink>
      </div>

      <button
        onClick={onToggle}
        className="flex h-8 items-center justify-center border-t border-slate-100 dark:border-slate-800/80 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200"
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </aside>
  );
}


