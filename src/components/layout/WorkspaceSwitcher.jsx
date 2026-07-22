import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Building2, ChevronDown, Check, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCreate(e) {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWorkspace(newWsName.trim());
    toast.success("New workspace created!");
    setNewWsName("");
    setShowCreateModal(false);
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
      >
        <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="max-w-[140px] truncate">{currentWorkspace.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-scale-in">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspaces</p>
          <div className="space-y-1">
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-bold">{ws.name}</p>
                    <p className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {ws.plan}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all text-left"
            >
              <Plus className="h-4 w-4" />
              <span>Create Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Workspace</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Workspace Name (e.g. Inbound Sales)"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-1.5 text-xs font-bold shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
