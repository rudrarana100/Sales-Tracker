import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../../features/leads/api/leadsApi";
import {
  Search,
  LayoutDashboard,
  Users,
  PhoneCall,
  Clock,
  Kanban,
  CheckSquare,
  Calendar,
  Settings,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  User,
} from "lucide-react";

export default function CommandPalette({ open, onClose, onToggleTheme, isDarkMode }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch leads when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setLoading(true);
      getLeads()
        .then((data) => setLeads(data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Static App Navigation Commands
  const navigationActions = [
    { id: "nav-dashboard", title: "Go to Dashboard", icon: LayoutDashboard, category: "Navigation", run: () => navigate("/dashboard") },
    { id: "nav-leads", title: "Go to Leads", icon: Users, category: "Navigation", run: () => navigate("/leads") },
    { id: "nav-call-session", title: "Start Call Session", icon: PhoneCall, category: "Navigation", run: () => navigate("/call-session") },
    { id: "nav-followups", title: "Go to Follow-ups", icon: Clock, category: "Navigation", run: () => navigate("/follow-ups") },
    { id: "nav-pipeline", title: "Go to Pipeline (Kanban)", icon: Kanban, category: "Navigation", run: () => navigate("/pipeline") },
    { id: "nav-tasks", title: "Go to Tasks", icon: CheckSquare, category: "Navigation", run: () => navigate("/tasks") },
    { id: "nav-calendar", title: "Go to Calendar", icon: Calendar, category: "Navigation", run: () => navigate("/calendar") },
    { id: "nav-settings", title: "Go to Settings", icon: Settings, category: "Navigation", run: () => navigate("/settings") },
  ];

  // Quick System Actions
  const quickActions = [
    { id: "act-theme", title: isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode", icon: isDarkMode ? Sun : Moon, category: "Actions", run: () => onToggleTheme?.() },
    { id: "act-new-lead", title: "Add New Lead", icon: Plus, category: "Actions", run: () => navigate("/leads?action=new") },
  ];

  // Filter Leads by Search Query
  const filteredLeads = query.trim()
    ? leads
        .filter(
          (l) =>
            l.lead_name?.toLowerCase().includes(query.toLowerCase()) ||
            l.contact_person?.toLowerCase().includes(query.toLowerCase()) ||
            l.phone?.includes(query)
        )
        .slice(0, 5)
        .map((lead) => ({
          id: `lead-${lead.id}`,
          title: lead.lead_name,
          subtitle: lead.contact_person ? `Contact: ${lead.contact_person}` : lead.phone || "",
          icon: User,
          category: "Leads",
          run: () => navigate(`/leads/${lead.id}`),
        }))
    : [];

  // Filter Navigation & Actions by Query
  const filteredNav = navigationActions.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredSystemActions = quickActions.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  // Consolidated Results List
  const allResults = [...filteredLeads, ...filteredNav, ...filteredSystemActions];

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside Palette (Up, Down, Enter, Esc)
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        allResults[selectedIndex].run();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, allResults, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      {/* Click Backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search leads..."
            className="h-12 w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {loading && (
            <p className="p-4 text-xs text-center text-slate-400 dark:text-slate-500">
              Searching workspace...
            </p>
          )}

          {!loading && allResults.length === 0 && (
            <p className="p-6 text-xs text-center text-slate-400 dark:text-slate-500">
              No matching commands or leads found.
            </p>
          )}

          {!loading &&
            allResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-blue-500" : "text-slate-400"}`} />
                    <div className="flex flex-col text-left truncate">
                      <span className="font-semibold truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[10px] text-slate-400 truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-600">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono">↑</kbd>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-mono">↵</kbd>
          </div>
          <span>SalesTracker Stack</span>
        </div>
      </div>
    </div>
  );
}