import { useState } from "react";
import RecentActivity from "./RecentActivity";

function Dashboard({ leads, onStartCalling }) {
  const [showRecentActivity, setShowRecentActivity] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const coldCallsRemaining = leads.filter(
    (lead) => lead.status === "cold"
  ).length;

  const followUpsToday = leads.filter(
    (lead) => lead.follow_up_date === today
  ).length;

  const meetingsToday = leads.filter(
    (lead) =>
      lead.status === "meeting_booked" &&
      lead.follow_up_date === today
  ).length;

  const todayTasks = leads
    .filter((lead) => lead.follow_up_date === today)
    .sort((a, b) =>
      (a.follow_up_time || "").localeCompare(
        b.follow_up_time || ""
      )
    );

  const overdueFollowUps = leads
    .filter(
      (lead) =>
        lead.follow_up_date &&
        lead.follow_up_date < today
    )
    .sort((a, b) =>
      (a.follow_up_time || "").localeCompare(
        b.follow_up_time || ""
      )
    );

  function getTaskLabel(status) {
    switch (status) {
      case "meeting_booked":
        return "Google Meet";

      case "contacted":
        return "Follow-up Call";

      case "warm":
        return "Warm Lead";

      case "proposal_sent":
        return "Proposal Follow-up";

      case "cold":
        return "Cold Call";

      default:
        return status;
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        marginBottom: "25px",
      }}
    >
      <h2>Today's Work</h2>

      <p>Cold Calls Remaining: {coldCallsRemaining}</p>
      <p>Follow-ups Today: {followUpsToday}</p>
      <p>Meetings Today: {meetingsToday}</p>

      <button onClick={onStartCalling}>
        Resume Calling
      </button>

      <hr />

      <h3>Needs Attention</h3>

      {overdueFollowUps.length === 0 ? (
        <p>No overdue follow-ups.</p>
      ) : (
        overdueFollowUps.map((lead) => (
          <div
            key={lead.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>{lead.lead_name}</strong>

            <br />

            Due: {lead.follow_up_date}

            <br />

            {lead.follow_up_time || "--:--"}
          </div>
        ))
      )}

      <hr />

      <h3>My Day</h3>

      {todayTasks.length === 0 ? (
        <p>No tasks scheduled for today.</p>
      ) : (
        todayTasks.map((lead) => (
          <div
            key={lead.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>{lead.follow_up_time || "--:--"}</strong>

            <br />

            {lead.lead_name}

            <br />

            <small>{getTaskLabel(lead.status)}</small>
          </div>
        ))
      )}

      <hr />

      <div
        onClick={() =>
          setShowRecentActivity(!showRecentActivity)
        }
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <h3>Recent Activity</h3>

        <span
          style={{
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {showRecentActivity ? "▲" : "▼"}
        </span>
      </div>

      {showRecentActivity && (
        <div style={{ marginTop: "15px" }}>
          <RecentActivity />
        </div>
      )}
    </div>
  );
}

export default Dashboard;