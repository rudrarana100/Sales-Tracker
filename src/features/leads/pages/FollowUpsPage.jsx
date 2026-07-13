import { useEffect, useState } from "react";
import { getFollowUps } from "../api/leadsApi";

function FollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  async function fetchFollowUps() {
    try {
      const data = await getFollowUps();
      setFollowUps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Follow-up Dashboard</h1>

      <p>Total Follow-ups: {followUps.length}</p>

      {followUps.length === 0 ? (
        <p>No follow-ups scheduled.</p>
      ) : (
        followUps.map((lead) => (
          <div
            key={lead.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>{lead.lead_name}</h3>

            <p>📅 {lead.follow_up_date}</p>

            <p>🕒 {lead.follow_up_time || "--"}</p>

            <p>📞 {lead.phone}</p>

            <p>Status: {lead.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default FollowUpsPage;