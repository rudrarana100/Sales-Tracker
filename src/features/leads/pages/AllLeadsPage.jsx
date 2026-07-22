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
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { const query = searchParams.get("search") || ""; setSearchTerm(query); }, [searchParams]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) { setSearchParams({ search: value }); } else { setSearchParams({}); }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leads" description="Manage and organize all your prospects." />
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-skeleton-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Management"
        description="Manage and organize all your prospects and deals."
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-9.5 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>
        <select
          className="h-9.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs outline-none focus:ring-1 focus:ring-slate-900"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
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
        <SectionCard title={<span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"><UserPlus className="h-4 w-4 text-blue-500" />Add New Lead</span>}>
          <LeadForm onLeadAdded={() => { fetchLeads(); setShowForm(false); }} />
        </SectionCard>
      )}

      <SectionCard title={`All Leads (${filteredLeads.length})`}>
        <LeadsList leads={filteredLeads} onStatusChange={fetchLeads} />
      </SectionCard>
    </div>
  );
}
export default AllLeadsPage;
