export default function TimelineCard({ leadId, refreshTrigger, ActivityTimeline }) {
  return (
    <div className="premium-card p-6">
      <h2 className="mb-4 text-sm font-medium text-foreground">Activity Timeline</h2>
      <ActivityTimeline leadId={leadId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
