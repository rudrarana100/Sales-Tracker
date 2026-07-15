export default function TimelineCard({
  leadId,
  refreshTrigger,
  ActivityTimeline,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Activity Timeline
      </h2>

      <ActivityTimeline
        leadId={leadId}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}