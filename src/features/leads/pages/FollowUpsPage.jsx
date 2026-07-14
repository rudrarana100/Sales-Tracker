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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const overdue = followUps.filter((lead) => {
    const date = new Date(lead.follow_up_date);
    date.setHours(0, 0, 0, 0);
    return date < today;
  });

  const todayFollowUps = followUps.filter((lead) => {
    const date = new Date(lead.follow_up_date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });

  const tomorrowFollowUps = followUps.filter((lead) => {
    const date = new Date(lead.follow_up_date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === tomorrow.getTime();
  });

  const upcoming = followUps.filter((lead) => {
    const date = new Date(lead.follow_up_date);
    date.setHours(0, 0, 0, 0);
    return date > tomorrow;
  });
function renderLeadCard(lead) {
  return (
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

      <p>👤 {lead.contact_person || "--"}</p>

      <p>📞 {lead.phone}</p>

      <p>🕒 {lead.follow_up_time || "--"}</p>

      <p>📅 {lead.follow_up_date}</p>

      <p>📌 {lead.status}</p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        <button
          onClick={() => {
            if (!lead.website) {
              alert("No website available.");
              return;
            }

            let url = lead.website;

            if (!url.startsWith("http")) {
              url = "https://" + url;
            }

            window.open(url, "_blank");
          }}
        >
          🌐 Website
        </button>

        <button
          onClick={() => {
            if (!lead.google_maps_link) {
              alert("No Google Maps link.");
              return;
            }

            window.open(lead.google_maps_link, "_blank");
          }}
        >
          📍 Maps
        </button>

        <button
          onClick={() => {
            if (!lead.phone) {
              alert("No phone number.");
              return;
            }

            let phone = lead.phone.replace(/\D/g, "");

            if (phone.length === 10) {
              phone = "91" + phone;
            }

            window.open(`https://wa.me/${phone}`, "_blank");
          }}
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
  return (
    <div style={{ padding: "20px" }}>
      <h1>Follow-up Dashboard</h1>

      <p>Total Follow-ups: {followUps.length}</p>

      {followUps.length === 0 ? (
        <p>No follow-ups scheduled.</p>
      ) : (
        <>
          <h2>🔴 Overdue ({overdue.length})</h2>
          {overdue.map(renderLeadCard)}

          <hr />

          <h2>🟡 Today ({todayFollowUps.length})</h2>
          {todayFollowUps.map(renderLeadCard)}

          <hr />

          <h2>🟢 Tomorrow ({tomorrowFollowUps.length})</h2>
          {tomorrowFollowUps.map(renderLeadCard)}

          <hr />

          <h2>📅 Upcoming ({upcoming.length})</h2>
          {upcoming.map(renderLeadCard)}
        </>
      )}
    </div>
  );
}

export default FollowUpsPage;
