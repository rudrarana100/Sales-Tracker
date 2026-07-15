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
  <div className="space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Leads
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage and organize all your prospects.
        </p>
      </div>
    </div>

    {/* Search + Filter */}
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
      <input
        className="h-11 w-full rounded-xl border border-zinc-200 px-4 outline-none transition focus:border-black md:max-w-sm"
        placeholder="Search leads..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        className="h-11 rounded-xl border border-zinc-200 px-4 outline-none"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="cold">Cold</option>
        <option value="contacted">Contacted</option>
        <option value="warm">Warm</option>
        <option value="meeting_booked">Meeting Booked</option>
        <option value="proposal_sent">Proposal Sent</option>
        <option value="closed_won">Closed Won</option>
        <option value="closed_lost">Closed Lost</option>
      </select>
    </div>

    {/* Add Lead */}
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-semibold">
        Add New Lead
      </h2>

      <LeadForm onLeadAdded={fetchLeads} />
    </div>

    {/* Leads Table */}
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <LeadsList
        leads={filteredLeads}
        onStatusChange={fetchLeads}
      />
    </div>
  </div>
);
}

export default AllLeadsPage;