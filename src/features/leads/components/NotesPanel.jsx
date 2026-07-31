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
        description: newNote,
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
          className="min-h-0 flex-1 resize-none"
        />
        <Button size="sm" onClick={handleAddNote} className="self-start shrink-0 cursor-pointer" disabled={adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedNotes.map((note) => (
            <div key={note.id} className="flex items-start justify-between rounded-2xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:shadow-subtle">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-card-foreground">{note.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive shrink-0 ml-2 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This note will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(note)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:shadow-subtle cursor-pointer mt-2"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show {notes.length - 2} More
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