import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  CalendarDays,
  KanbanSquare,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Leads", icon: Users, path: "/leads" },
  { title: "Call Session", icon: Phone, path: "/call-session" },
  { title: "Follow-ups", icon: CalendarDays, path: "/follow-ups" },
  { title: "Deals", icon: BriefcaseBusiness, path: "/deals" },
  { title: "Pipeline", icon: KanbanSquare, path: "/pipeline" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-[--sidebar-width] flex-col border-r border-ash bg-canvas-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          S
        </div>

        <div>
          <h1 className="text-sm font-medium text-charcoal">
            SalesTracker
          </h1>
          <p className="text-[11px] text-fog">
            Outbound CRM
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex h-8 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-paper-mist text-charcoal"
                    : "text-fog hover:bg-paper-mist hover:text-charcoal",
                ].join(" ")
              }
            >
              <Icon size={16} className="shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ash p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex h-8 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-paper-mist text-charcoal"
                : "text-fog hover:bg-paper-mist hover:text-charcoal",
            ].join(" ")
          }
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}