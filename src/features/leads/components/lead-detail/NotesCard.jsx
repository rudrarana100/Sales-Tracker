export default function NotesCard({ leadId, setTimelineRefresh, NotesPanel }) {
  return (
    <div className="rounded-xl border border-ash bg-canvas-white p-5">
      <h2 className="mb-4 text-sm font-medium text-charcoal">Notes</h2>
      <NotesPanel
        leadId={leadId}
        onNoteAdded={() => setTimelineRefresh((prev) => prev + 1)}
      />
    </div>
  );
}
