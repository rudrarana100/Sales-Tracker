import { useEffect, useState } from "react";
import { getActivities } from "../api/activitiesApi";

function ActivityTimeline({ leadId }) {
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
  }, [leadId]);

  function formatActivity(activity) {
    switch (activity.activity_type) {
      case "meeting":
        return "📅 Google Meet Booked";

      case "callback":
        return "📞 Callback Scheduled";

      case "status_change":
        return "🟢 Status Updated";

      case "call_outcome":
        return "☎️ Call Outcome";

      case "note":
        return "📝 Note";

      default:
        return activity.activity_type;
    }
  }

  function formatDescription(activity) {
    if (activity.activity_type !== "call_outcome") {
      return activity.description;
    }

    switch (activity.description) {
      case "no_answer":
        return "📵 No answer from the lead";

      case "gatekeeper":
        return "🚪 Reached gatekeeper";

      case "not_interested":
        return "❌ Lead was not interested";

      case "invalid_number":
        return "🚫 Invalid phone number";

      default:
        return activity.description;
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Activity Timeline</h3>

      {activities.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            style={{
              borderLeft: "3px solid royalblue",
              paddingLeft: "15px",
              marginBottom: "18px",
            }}
          >
            <h4>{formatActivity(activity)}</h4>

            <p>{formatDescription(activity)}</p>

            <small>
              {new Date(activity.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}

              {" • "}

              {new Date(activity.created_at).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default ActivityTimeline;