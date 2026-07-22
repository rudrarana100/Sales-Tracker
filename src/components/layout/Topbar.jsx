import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Topbar({ onMenuToggle = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function handleSearch(e) {
    if (e.key === "Enter") {
      const query = search.trim();
      if (!query) return;
      navigate(`/leads?search=${encodeURIComponent(query)}`);
      setSearch("");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Left side: Mobile menu & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search input */}
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search leads..."
            className="h-9 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Right side Utility Bar */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        {/* User Avatar */}
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
          RR
        </div>
      </div>
    </header>
  );
}


