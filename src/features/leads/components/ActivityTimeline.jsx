import { useEffect, useState } from "react";
import { getActivities } from "../api/activitiesApi";

const activityIcons = {
  meeting: "📅",
  callback: "📞",
  status_change: "🔄",
  call_outcome: "☎️",
  note: "📝",
  note_deleted: "🗑️",
};

function ActivityTimeline({ leadId, refreshTrigger }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!leadId) return;
    async function fetchActivities() {
      try {
        const data = await getActivities(leadId);
        setActivities(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchActivities();
  }, [leadId, refreshTrigger]);

  function formatDescription(activity) {
    if (activity.activity_type !== "call_outcome") return activity.description;
    switch (activity.description) {
      case "no_answer": return "No answer from the lead";
      case "gatekeeper": return "Reached gatekeeper";
      case "not_interested": return "Lead was not interested";
      case "invalid_number": return "Invalid phone number";
      default: return activity.description;
    }
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-xs text-fog">No activity yet.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-sm">{activityIcons[activity.activity_type] || "📌"}</span>
              <div className="mt-1 w-px flex-1 bg-ash" />
            </div>
            <div className="pb-3">
              <p className="text-sm text-charcoal">{formatDescription(activity)}</p>
              <p className="text-[11px] text-fog">
                {new Date(activity.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
                {" • "}
                {new Date(activity.created_at).toLocaleTimeString("en-IN", {
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ActivityTimeline;
