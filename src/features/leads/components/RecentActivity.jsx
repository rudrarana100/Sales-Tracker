import { useEffect, useState } from "react";
import { getRecentActivities } from "../api/activitiesApi";

function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getRecentActivities();
      setActivities(data);
    }

    load();
  }, []);

  return (
    <div>
      <h3>Recent Activity</h3>

      {activities.map((activity) => (
        <div key={activity.id}>
          <strong>{activity.leads?.lead_name}</strong>

          <br />

          {activity.description}

          <br />

          <small>
            {new Date(activity.created_at).toLocaleString()}
          </small>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;