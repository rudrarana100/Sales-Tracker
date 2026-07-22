import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Menu, LogOut, User, Settings } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import NotificationCenter from "../notifications/NotificationCenter";

export default function Topbar({ onMenuToggle = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e) {
    if (e.key === "Enter") {
      const query = search.trim();
      if (!query) return;
      navigate(`/leads?search=${encodeURIComponent(query)}`);
      setSearch("");
    }
  }

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
    : "RR";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Left side: Mobile menu, Workspace Switcher & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all duration-200"
        >
          <Menu className="h-4 w-4" />
        </button>

        <WorkspaceSwitcher />

        {/* Search input */}
        <div className="relative hidden sm:block w-48 sm:w-64">
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

        {/* Live Notification Center */}
        <NotificationCenter />

        {/* User Avatar & Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-blue-600 font-bold text-xs shadow-xs hover:opacity-90 transition-all"
          >
            {userInitials}
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="space-y-0.5 pt-1">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



