import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderKanban, Plus, Folder, Check, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

export default function CollectionManagerModal({
  open,
  onClose,
  collections = [],
  selectedCollection,
  onSelectCollection,
  leads = [],
}) {
  const [newFolderInput, setNewFolderInput] = useState("");

  function handleCreateFolder(e) {
    e.preventDefault();
    if (!newFolderInput.trim()) return;
    const folderName = newFolderInput.trim();
    onSelectCollection(folderName);
    toast.success(`Switched to new collection: "${folderName}"`);
    setNewFolderInput("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-md w-[90vw] p-6 space-y-4 rounded-2xl">
        <DialogHeader className="space-y-1 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Layers className="h-5 w-5 text-blue-600" />
            Lead Collections & Folders
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Switch views or organize your prospects by industry and campaign folders.
          </DialogDescription>
        </DialogHeader>

        {/* Create New Collection Form */}
        <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
          <Input
            placeholder="New Collection Name (e.g. Bhopal CAs)"
            value={newFolderInput}
            onChange={(e) => setNewFolderInput(e.target.value)}
            className="text-xs h-9 bg-slate-50 dark:bg-slate-950 flex-1"
          />
          <Button type="submit" size="sm" className="h-9 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </form>

        {/* Collections List */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {/* Default 'All Leads' Option */}
          <div
            onClick={() => {
              onSelectCollection("all");
              onClose();
            }}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs ${
              selectedCollection === "all"
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="h-4 w-4 text-slate-500" />
              <span>All Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] text-slate-500">
                {leads.length}
              </span>
              {selectedCollection === "all" && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          </div>

          {/* Custom Collections */}
          {collections.map((col) => {
            const count = leads.filter((l) => l.import_batch === col).length;
            const isSelected = selectedCollection === col;

            return (
              <div
                key={col}
                onClick={() => {
                  onSelectCollection(col);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-blue-500"}`} />
                  <span className="truncate max-w-[200px]">{col}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] text-slate-500">
                    {count}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}