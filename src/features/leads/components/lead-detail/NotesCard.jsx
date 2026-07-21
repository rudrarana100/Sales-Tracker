export default function NotesCard({ leadId, setTimelineRefresh, NotesPanel }) {
  return (
    <div className="premium-card p-6">
      <h2 className="mb-4 text-sm font-medium text-foreground">Notes</h2>
      <NotesPanel
        leadId={leadId}
        onNoteAdded={() => setTimelineRefresh((prev) => prev + 1)}
      />
    </div>
  );
}
