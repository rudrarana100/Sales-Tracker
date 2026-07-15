export default function NotesCard({
  leadId,
  setTimelineRefresh,
  NotesPanel,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Notes
      </h2>

      <NotesPanel
        leadId={leadId}
        onNoteAdded={() =>
          setTimelineRefresh((prev) => prev + 1)
        }
      />
    </div>
  );
}