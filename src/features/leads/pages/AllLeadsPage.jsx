import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { Search, Plus, UserPlus } from "lucide-react";

function AllLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

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
      lead.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || lead.status === statusFilter)
    );
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        description="Manage and organize all your prospects."
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-3.5 w-3.5" />
            Add Lead
          </Button>
        }
      />

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
        <select
          className="h-8 rounded-md border border-ash bg-canvas-white px-3 text-sm text-charcoal outline-none"
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

      {/* Add Lead Form */}
      {showForm && (
        <SectionCard title={
          <span className="flex items-center gap-2">
            <UserPlus className="h-3.5 w-3.5" />
            Add New Lead
          </span>
        }>
          <LeadForm onLeadAdded={() => { fetchLeads(); setShowForm(false); }} />
        </SectionCard>
      )}

      {/* Leads List */}
      <SectionCard title={`All Leads (${filteredLeads.length})`}>
        <LeadsList leads={filteredLeads} onStatusChange={fetchLeads} />
      </SectionCard>
    </div>
  );
}

export default AllLeadsPage;
