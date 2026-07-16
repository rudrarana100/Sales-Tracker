export default function TimelineCard({ leadId, refreshTrigger, ActivityTimeline }) {
  return (
    <div className="rounded-xl border border-ash bg-canvas-white p-5">
      <h2 className="mb-4 text-sm font-medium text-charcoal">Activity Timeline</h2>
      <ActivityTimeline leadId={leadId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
