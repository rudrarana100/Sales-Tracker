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
    <div className="space-y-2">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No recent activity.
        </p>
      ) : (
        <>
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
            >
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  {activity.leads?.lead_name}
                </span>
                {" — "}
                {activity.description}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {activities.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent"
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
