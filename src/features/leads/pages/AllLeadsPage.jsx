import { useEffect, useState, useRef } from "react";
import { getLeads, deleteAllLeads, deleteMultipleLeads, getImportBatches } from "../api/leadsApi";
import { useSearchParams } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";
import CsvImport from "../components/CsvImport";
import { exportLeadsToCsv } from "@/utils/exportUtils";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { Search, Plus, UserPlus, Upload, Download, Trash2, FolderKanban } from "lucide-react";
import { toast } from "sonner";

function AllLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const csvImportRef = useRef(null);

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
      const batchList = await getImportBatches();
      setBatches(batchList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

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
      
    const matchesBatch =
      batchFilter === "all" || lead.import_batch === batchFilter;

    return matchesSearch && matchesStatus && matchesBatch;
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

  function handleExport() {
    if (!filteredLeads || filteredLeads.length === 0) {
      toast.warning("No leads available to export.");
      return;
    }
    exportLeadsToCsv(filteredLeads, "sales_tracker_filtered_leads.csv");
    toast.success(`Successfully exported ${filteredLeads.length} leads to CSV.`);
  }

  async function handleDeleteSelected() {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected leads?`)) return;
    
    try {
      await deleteMultipleLeads(selectedLeadIds);
      toast.success(`Successfully deleted ${selectedLeadIds.length} leads.`);
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete selected leads.");
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm("⚠️ Are you sure you want to delete ALL leads? This action cannot be undone.")) return;
    
    try {
      await deleteAllLeads();
      toast.success("All leads have been deleted.");
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete all leads.");
    }
  }

  if (loading) {
    return <LoadingState message="Loading prospects directory..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Management"
        description="Manage and organize all your prospects and deals."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Delete Selected Button */}
            {selectedLeadIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
            )}

            {/* Delete All Button */}
            {leads.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All</span>
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Import CSV Button */}
            <button
              onClick={() => csvImportRef.current?.openFilePicker()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Import CSV</span>
            </button>

            {/* Add Lead Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </button>
          </div>
        }
      />

      {/* Hidden CsvImport Component Trigger */}
      <CsvImport ref={csvImportRef} onImport={fetchLeads} />

      {/* Clean Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-9.5 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          className="h-9.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
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

        {/* Import Batch Collection Filter */}
        <div className="relative flex items-center">
          <FolderKanban className="absolute left-3 h-3.5 w-3.5 text-blue-500 pointer-events-none" />
          <select
            className="h-9.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer appearance-none"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="all">All Import Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <SectionCard
          title={
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <UserPlus className="h-4 w-4 text-blue-500" />
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
          selectedLeadIds={selectedLeadIds}
          setSelectedLeadIds={setSelectedLeadIds}
        />
      </SectionCard>
    </div>
  );
}

export default AllLeadsPage;