import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getRecentActivities } from "../api/activitiesApi";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getRecentActivities();
      setActivities(data);
    }

    load();
  }, []);

  const displayedActivities = expanded
    ? activities
    : activities.slice(0, 3);

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-xs text-fog">
          No recent activity.
        </p>
      ) : (
        <>
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-ash px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm text-charcoal">
                <span className="font-medium">
                  {activity.leads?.lead_name}
                </span>
                {" — "}
                {activity.description}
              </p>

              <p className="mt-1 text-[11px] text-fog">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {activities.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-ash py-2 text-sm font-medium text-fog transition hover:bg-muted"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show {activities.length - 3} More
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default RecentActivity;