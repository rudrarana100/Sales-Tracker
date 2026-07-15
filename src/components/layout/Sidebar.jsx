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
    <aside className="w-72 border-r border-zinc-200 bg-[#faf6f1] p-6 flex flex-col">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          BuiltStack
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Outbound CRM
        </p>
      </div>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-white border border-zinc-200 text-black"
                    : "text-zinc-500 hover:bg-white hover:text-black"
                }`
              }
            >
              <Icon size={18} />

              <span className="font-medium">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
              isActive
                ? "bg-white border border-zinc-200"
                : "hover:bg-white"
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}