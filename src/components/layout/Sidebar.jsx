import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  CalendarDays,
  KanbanSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
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
      className={`flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-[--sidebar-collapsed-width]" : "w-[--sidebar-width]"
      }`}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            S
          </div>
          <div className={`transition-opacity duration-200 ${collapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
            <h1 className="text-sm font-medium leading-tight">SalesTracker</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Outbound CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 sidebar-scroll">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex h-9 items-center rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center px-0 mx-auto w-9" : "gap-3 px-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <span className={`transition-opacity duration-200 ${collapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"}`}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex h-9 items-center rounded-lg text-sm font-medium transition-all duration-150",
              collapsed ? "justify-center px-0 mx-auto w-9" : "gap-3 px-3",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            ].join(" ")
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="shrink-0" />
          <span className={`transition-opacity duration-200 ${collapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"}`}>
            Settings
          </span>
        </NavLink>
      </div>

      <button
        onClick={onToggle}
        className="flex h-9 items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-150"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
