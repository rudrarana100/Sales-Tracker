import { useEffect, useState } from "react";
import { addNote, getNotes, deleteNote } from "../api/notesApi";
import { addActivity } from "../api/activitiesApi";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
        <textarea
          rows={2}
          className="min-h-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring resize-none"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button size="sm" onClick={handleAddNote} className="self-start">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between rounded-lg border bg-muted/50 px-4 py-3"
            >
              <div>
                <p className="text-sm text-foreground">{note.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive shrink-0"
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
