import { useEffect, useState } from "react";
import { addNote, getNotes, deleteNote } from "../api/notesApi";
import { addActivity } from "../api/activitiesApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText } from "lucide-react";
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

  async function fetchNotes() {
    try {
      const data = await getNotes(leadId);
      setNotes(data);
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
        <Button size="sm" onClick={handleAddNote} className="self-start shrink-0">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="mb-2 h-6 w-6 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between rounded-xl border border-border bg-muted/50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-card-foreground">{note.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This note will be
                      permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(note)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotesPanel;
