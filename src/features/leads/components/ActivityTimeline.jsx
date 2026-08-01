import { useEffect, useState } from "react";
import { getActivities } from "../api/activitiesApi";
import { Phone, Calendar, RefreshCw, PhoneCall, FileText, Trash2, Video, ChevronDown, ChevronUp } from "lucide-react";

const activityIcons = {
  meeting: Video,
  callback: Phone,
  status_change: RefreshCw,
  call_outcome: PhoneCall,
  note: FileText,
  note_deleted: Trash2,
};

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

function ActivityTimeline({ leadId, refreshTrigger }) {
  const [activities, setActivities] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    async function fetchActivities() {
      try {
        const data = await getActivities(leadId);
        setActivities(data || []);
      } catch (error) {
        console.error(error);
      }
    }
    fetchActivities();
  }, [leadId, refreshTrigger]);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No activity recorded yet.</p>
      </div>
    );
  }

  const displayedActivities = expanded ? activities : activities.slice(0, 3);

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity, index) => {
        const Icon = activityIcons[activity.activity_type] || RefreshCw;
        const isLast = index === displayedActivities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                <Icon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              </div>
              {(!isLast || (!expanded && activities.length > 3)) && (
                <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3.5"}`}>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {formatDescription(activity)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 font-medium">
                {activity.created_at ? (
                  <>
                    {new Date(activity.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                    {" · "}
                    {new Date(activity.created_at).toLocaleTimeString("en-IN", {
                      hour: "numeric", minute: "2-digit", hour12: true,
                    })}
                  </>
                ) : (
                  "Just now"
                )}
              </p>
            </div>
          </div>
        );
      })}

      {activities.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer mt-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show {activities.length - 3} More</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ActivityTimeline;