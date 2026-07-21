import { useEffect, useState } from "react";
import { getActivities } from "../api/activitiesApi";
import { Phone, Calendar, RefreshCw, PhoneCall, FileText, Trash2, Video } from "lucide-react";

const activityIcons = {
  meeting: Video,
  callback: Phone,
  status_change: RefreshCw,
  call_outcome: PhoneCall,
  note: FileText,
  note_deleted: Trash2,
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

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="mb-2 h-6 w-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.activity_type] || RefreshCw;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className={isLast ? "pb-0" : "pb-3"}>
              <p className="text-sm text-card-foreground">{formatDescription(activity)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(activity.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
                {" · "}
                {new Date(activity.created_at).toLocaleTimeString("en-IN", {
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;
