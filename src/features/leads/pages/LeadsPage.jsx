import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalLeads = leads.length;

  const coldLeads = leads.filter((lead) => lead.status === "cold").length;

  const warmLeads = leads.filter((lead) => lead.status === "warm").length;

  const proposalSent = leads.filter(
    (lead) => lead.status === "proposal_sent",
  ).length;

  const closedWon = leads.filter((lead) => lead.status === "closed_won").length;
  const closedLost = leads.filter(
    (lead) => lead.status === "closed_lost",
  ).length;

  const contacted = leads.filter((lead) => lead.status === "contacted").length;

  const filteredLeads = leads.filter((lead) => {
    return (
      lead.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || lead.status === statusFilter)
    );
  });

  const today = new Date().toISOString().split("T")[0];

  const todayFollowUps = leads
  .filter((lead) => lead.follow_up_date === today)
  .sort((a, b) =>
    (a.follow_up_time || "").localeCompare(b.follow_up_time || "")
  );

const overdueFollowUps = leads
  .filter((lead) => lead.follow_up_date && lead.follow_up_date < today)
  .sort((a, b) =>
    (a.follow_up_time || "").localeCompare(b.follow_up_time || "")
  );

const upcomingFollowUps = leads
  .filter((lead) => lead.follow_up_date && lead.follow_up_date > today)
  .sort((a, b) =>
    (a.follow_up_time || "").localeCompare(b.follow_up_time || "")
  );

  console.table(
    leads.map((lead) => ({
      id: lead.id,
      name: lead.lead_name,
      status: lead.status,
      follow_up_date: lead.follow_up_date,
    })),
  );

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  function formatTime(time) {
    if (!time) return "--";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="cold">Cold</option>
        <option value="contacted">Contacted</option>
        <option value="warm">Warm</option>
        <option value="proposal_sent">Proposal Sent</option>
        <option value="closed_won">Closed Won</option>
        <option value="closed_lost">Closed Lost</option>
      </select>
      <div>
        <h2>Follow-ups Today ({todayFollowUps.length})</h2>
        {todayFollowUps.length === 0 ? (
          <p>No Follow-ups today</p>
        ) : (
          todayFollowUps.map((lead) => (
            <div
              key={lead.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: "10px",
                padding: "10px",
              }}
            >
              <p>
                {lead.lead_name} | {formatTime(lead.follow_up_time)} |{" "}
                {lead.status}
              </p>
            </div>
          ))
        )}
      </div>
      <div>
        <h2>Overdue Follow-ups ({overdueFollowUps.length})</h2>
        {overdueFollowUps.length === 0 ? (
          <p>No Overdue follow-ups</p>
        ) : (
          overdueFollowUps.map((lead) => (
            <div
              key={lead.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: "10px",
                padding: "10px",
              }}
            >
              <p>
                {lead.lead_name} | {formatTime(lead.follow_up_time)} |{" "}
                {lead.status}
              </p>
            </div>
          ))
        )}
      </div>
      <div>
        <h2>Upcoming Follow-ups ({upcomingFollowUps.length})</h2>
        {upcomingFollowUps.length === 0 ? (
          <p>No Upcoming follow-ups</p>
        ) : (
          upcomingFollowUps.map((lead) => (
            <div
              key={lead.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: "10px",
                padding: "10px",
              }}
            >
              <p>
                {lead.lead_name} | {formatTime(lead.follow_up_time)} |{" "}
                {lead.status}
              </p>
            </div>
          ))
        )}
      </div>
      <div>
        <p>Total: {totalLeads}</p>
        <p>Cold: {coldLeads}</p>
        <p>Warm: {warmLeads}</p>
        <p>Proposal: {proposalSent}</p>
        <p>Won: {closedWon}</p>
        <p>Lost: {closedLost}</p>
        <p>Contacted: {contacted}</p>
      </div>
      <input
        value={searchTerm}
        placeholder="Search leads..."
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
      />
      <h1>Sales Tracker</h1>

      <LeadForm onLeadAdded={fetchLeads} />

      <LeadsList leads={filteredLeads} onStatusChange={fetchLeads} />
    </div>
  );
}

export default LeadsPage;
