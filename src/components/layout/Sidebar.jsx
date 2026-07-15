import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Phone,
 CalendarDays,
  KanbanSquare,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Leads",
    icon: Users,
    path: "/leads",
  },
  {
    name: "Call Session",
    icon: Phone,
    path: "/call-session",
  },
  {
    name: "Follow-ups",
    icon: CalendarDays,
    path: "/follow-ups",
  },
  {
    name: "Pipeline",
    icon: KanbanSquare,
    path: "/pipeline",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white px-4 py-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-10">
        BuiltStack CRM
      </h1>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-black text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}