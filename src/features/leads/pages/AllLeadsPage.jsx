import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";

function AllLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      <h1>All Leads</h1>

      <input
        placeholder="Search..."
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

      <LeadForm onLeadAdded={fetchLeads} />

      <LeadsList
        leads={filteredLeads}
        onStatusChange={fetchLeads}
      />
    </div>
  );
}

export default AllLeadsPage;