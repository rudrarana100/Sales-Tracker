import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Menu, LogOut, Settings } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import NotificationCenter from "../notifications/NotificationCenter";
import CommandPalette from "@/components/common/CommandPalette";

export default function Topbar({ onMenuToggle = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Global Ctrl + K / Cmd + K Shortcut Listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleTouchOrMouseOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleTouchOrMouseOutside);
    document.addEventListener("touchstart", handleTouchOrMouseOutside);
    return () => {
      document.removeEventListener("mousedown", handleTouchOrMouseOutside);
      document.removeEventListener("touchstart", handleTouchOrMouseOutside);
    };
  }, []);

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
    : "RR";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Command Palette Trigger Button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center justify-between min-w-[150px] xs:min-w-[200px] sm:w-64 h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer active:scale-98"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Search leads or actions...</span>
            </span>
            <kbd className="hidden xs:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side Utility Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          <NotificationCenter />

          {/* User Avatar & Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-blue-600 font-bold text-xs shadow-xs hover:opacity-90 transition-all active:scale-95 cursor-pointer"
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
                    type="button"
                    onClick={() => {
                      navigate("/settings");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left cursor-pointer"
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

      {/* Global Command Palette Overlay Modal */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onToggleTheme={toggleTheme}
        isDarkMode={theme === "dark"}
      />
    </>
  );
}