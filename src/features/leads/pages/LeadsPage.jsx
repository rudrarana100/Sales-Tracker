import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";
import Dashboard from "../components/Dashboard";
import { useNavigate } from "react-router-dom";
import CsvImport from "../components/CsvImport";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

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

  const filteredLeads = leads.filter((lead) => {
    return (
      lead.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || lead.status === statusFilter)
    );
  });

  return (
    <div>
      <Dashboard
        leads={leads}
        onStartCalling={() => navigate("/call-session")}
      />

      <input
        type="text"
        placeholder="Search leads..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="cold">Cold</option>
        <option value="contacted">Contacted</option>
        <option value="warm">Warm</option>
        <option value="meeting_booked">Meeting Booked</option>
        <option value="proposal_sent">Proposal Sent</option>
        <option value="closed_won">Closed Won</option>
        <option value="closed_lost">Closed Lost</option>
      </select>

      <h1>Sales Tracker</h1>


      <CsvImport />

      <LeadForm onLeadAdded={fetchLeads} />

      <LeadsList leads={filteredLeads} onStatusChange={fetchLeads} />
    </div>
  );
}

export default LeadsPage;
