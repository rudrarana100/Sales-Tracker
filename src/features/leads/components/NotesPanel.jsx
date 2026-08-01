import { useEffect, useState } from "react";
import { addNote, getNotes, deleteNote } from "../api/notesApi";
import { addActivity } from "../api/activitiesApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function NotesPanel({ leadId, onNoteAdded }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function fetchNotes() {
    try {
      const data = await getNotes(leadId);
      setNotes(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!leadId) return;
    fetchNotes();
  }, [leadId]);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setAdding(true);
    try {
      await addNote({ lead_id: leadId, content: newNote.trim() });
      await addActivity({
        lead_id: leadId,
        activity_type: "note",
        description: newNote.trim(),
      });
      onNoteAdded?.();
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(note) {
    try {
      await deleteNote(note.id);
      await addActivity({
        lead_id: leadId,
        activity_type: "note_deleted",
        description: `Deleted note: "${note.content}"`,
      });
      toast.success("Note deleted");
      fetchNotes();
      onNoteAdded?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete note");
    }
  }

  const displayedNotes = expanded ? notes : notes.slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Textarea
          rows={2}
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-0 flex-1 resize-none text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3"
        />
        <Button size="sm" onClick={handleAddNote} className="self-start shrink-0 cursor-pointer rounded-xl bg-slate-900 text-white dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-xs font-bold h-9 px-4" disabled={adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>Add</span>
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No notes recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedNotes.map((note) => (
            <div key={note.id} className="flex items-start justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 transition-all duration-150 hover:shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{note.content}</p>
                <p className="mt-1 text-[10px] text-slate-400 font-medium">
                  {note.created_at ? (
                    <>
                      {new Date(note.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      {" · "}
                      {new Date(note.created_at).toLocaleTimeString("en-IN", {
                        hour: "numeric", minute: "2-digit", hour12: true,
                      })}
                    </>
                  ) : (
                    "Just now"
                  )}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button title="Delete Note" className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0 ml-2 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold">Delete Note?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                      This action cannot be undone. This note will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(note)} className="bg-rose-600 text-white hover:bg-rose-500 rounded-xl text-xs font-bold shadow-xs cursor-pointer">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {notes.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer mt-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show {notes.length - 2} More</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NotesPanel;