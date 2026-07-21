import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Activity } from "lucide-react";
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

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="mb-2 h-6 w-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedActivities.map((activity) => (
        <div
          key={activity.id}
          className="rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <p className="text-sm text-card-foreground">
            <span className="font-medium">
              {activity.leads?.lead_name}
            </span>
            {" — "}
            {activity.description}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(activity.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      {activities.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
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
    </div>
  );
}

export default RecentActivity;
