import { useEffect, useState } from "react";
import { addNote, getNotes, deleteNote } from "../api/notesApi";
import { addActivity } from "../api/activitiesApi";

function NotesPanel({ leadId }) {
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
      await addNote({
        lead_id: leadId,
        content: newNote.trim(),
      });

      // Also log it in the activity timeline
      await addActivity({
        lead_id: leadId,
        activity_type: "note",
        description: newNote,
      });

      setNewNote("");

      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);

      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Notes</h3>

      <textarea
        rows={4}
        style={{ width: "100%" }}
        placeholder="Write a note..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
      />

      <br />

      <button onClick={handleAddNote}>Add Note</button>

      <hr />

      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <p>{note.content}</p>

            <small>{new Date(note.created_at).toLocaleString()}</small>

            <br />

            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default NotesPanel;
