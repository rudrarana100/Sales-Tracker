import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import { useSearchParams } from "react-router-dom";

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

  const [searchParams, setSearchParams] = useSearchParams();

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

  // Sync URL -> Search Input
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchTerm(query);
  }, [searchParams]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearchTerm(value);

    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Manage and organize all your prospects."
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-9 rounded-lg pl-9"
          />
        </div>

        <select
          className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
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

      {showForm && (
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Lead
            </span>
          }
        >
          <LeadForm
            onLeadAdded={() => {
              fetchLeads();
              setShowForm(false);
            }}
          />
        </SectionCard>
      )}

      <SectionCard title={`All Leads (${filteredLeads.length})`}>
        <LeadsList
          leads={filteredLeads}
          onStatusChange={fetchLeads}
        />
      </SectionCard>
    </div>
  );
}

export default AllLeadsPage;