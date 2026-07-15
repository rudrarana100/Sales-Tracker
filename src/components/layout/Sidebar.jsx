import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
  CalendarDays,
  KanbanSquare,
  Settings,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Leads",
    icon: Users,
    path: "/leads",
  },
  {
    title: "Call Session",
    icon: Phone,
    path: "/call-session",
  },
  {
    title: "Follow-ups",
    icon: CalendarDays,
    path: "/follow-ups",
  },
  {
    title: "Pipeline",
    icon: KanbanSquare,
    path: "/pipeline",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="border-b border-zinc-100 px-6 py-6">
        <h1 className="text-xl font-semibold tracking-tight">
          BuiltStack
        </h1>

        <p className="mt-1 text-xs text-zinc-500">
          Outbound CRM
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                ].join(" ")
              }
            >
              <Icon
                size={17}
                className="transition-colors"
              />

              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all",
              isActive
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
            ].join(" ")
          }
        >
          <Settings size={17} />

          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}