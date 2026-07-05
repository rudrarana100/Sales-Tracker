import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLeads = leads.filter((lead)=> {
    return (
    lead.lead_name
    .toLowerCase()
    .includes(searchTerm.toLowerCase()) 
    &&
    (
      statusFilter === "all" || lead.status === statusFilter
    )
    )
  }
  )


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
      <input 
      value={searchTerm}
      placeholder="Search leads..."
      onChange={(e) => setSearchTerm(e.target.value)}
      type="text"  />
      <h1>Sales Tracker</h1>

      <LeadForm onLeadAdded={fetchLeads} />

      <LeadsList 
      leads={filteredLeads}
      onStatusChange={fetchLeads} />
    </div>
  );
}

export default LeadsPage;