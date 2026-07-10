import RecentActivity from "./RecentActivity";

function Dashboard({ leads, onStartCalling }) {
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

      {/* Needs Attention */}

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

      {/* My Day */}

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
            <strong>
              {lead.follow_up_time || "--:--"}
            </strong>

            <br />

            {lead.lead_name}

            <br />

            <small>{lead.status}</small>
          </div>
        ))
      )}

      <hr />

      {/* Recent Activity */}

      <RecentActivity />
    </div>
  );
}

export default Dashboard;