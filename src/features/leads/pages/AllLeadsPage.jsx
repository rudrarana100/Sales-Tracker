import { useEffect, useState, useRef, lazy, Suspense } from "react";
import {
  getLeads,
  deleteAllLeads,
  deleteMultipleLeads,
  getImportBatches,
  assignLeadsToCollection,
} from "../api/leadsApi";
import { useSearchParams } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import LeadsList from "../components/LeadsList";
import CsvImport from "../components/CsvImport";
import { exportLeadsToCsv } from "@/utils/exportUtils";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import {
  Search,
  Plus,
  UserPlus,
  Upload,
  Download,
  Trash2,
  FolderKanban,
  MapPin,
  Globe,
  Mail,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";

// Lazy Loaded Modal and Form Components for Code-Splitting
const LeadForm = lazy(() => import("../components/LeadForm"));
const LeadScraperModal = lazy(() => import("../components/LeadScraperModal"));
const CollectionManagerModal = lazy(() => import("../components/CollectionManagerModal"));

function AllLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [collections, setCollections] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const [targetCollectionInput, setTargetCollectionInput] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const csvImportRef = useRef(null);

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data || []);
      const batchList = await getImportBatches();
      setCollections((batchList || []).filter(Boolean));
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

    const matchesCollection =
      selectedCollection === "all" || lead.import_batch === selectedCollection;

    let matchesWebsite = true;
    if (websiteFilter === "has_website") {
      matchesWebsite = Boolean(lead.website && lead.website.trim() !== "");
    } else if (websiteFilter === "no_website") {
      matchesWebsite = !lead.website || lead.website.trim() === "";
    }

    let matchesEmail = true;
    if (emailFilter === "has_email") {
      matchesEmail = Boolean(lead.email && lead.email.trim() !== "");
    } else if (emailFilter === "no_email") {
      matchesEmail = !lead.email || lead.email.trim() === "";
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCollection &&
      matchesWebsite &&
      matchesEmail
    );
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
    toast.success(`Exported ${filteredLeads.length} leads.`);
  }

  async function handleMoveToCollection() {
    if (!targetCollectionInput.trim()) {
      toast.warning("Enter a collection name.");
      return;
    }

    try {
      await assignLeadsToCollection(
        selectedLeadIds,
        targetCollectionInput.trim()
      );
      toast.success(
        `Moved ${selectedLeadIds.length} lead(s) to "${targetCollectionInput.trim()}"`
      );
      setSelectedLeadIds([]);
      setTargetCollectionInput("");
      setShowMoveModal(false);
      fetchLeads();
    } catch (error) {
      toast.error("Failed to move leads.");
    }
  }

  async function handleDeleteSelected() {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedLeadIds.length} selected leads?`))
      return;

    try {
      await deleteMultipleLeads(selectedLeadIds);
      toast.success(`Deleted ${selectedLeadIds.length} leads.`);
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (error) {
      toast.error("Failed to delete leads.");
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm("⚠️ Are you sure you want to delete ALL leads?"))
      return;

    try {
      await deleteAllLeads();
      toast.success("All leads deleted.");
      setSelectedLeadIds([]);
      fetchLeads();
    } catch (error) {
      toast.error("Failed to delete all leads.");
    }
  }

  if (loading) {
    return <LoadingState message="Loading prospect directory..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Directory"
        description="Manage and organize all your prospects and deals."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedLeadIds.length > 0 && (
              <button
                onClick={() => setShowMoveModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Move to Collection ({selectedLeadIds.length})</span>
              </button>
            )}

            {selectedLeadIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
            )}

            {leads.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All</span>
              </button>
            )}

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => csvImportRef.current?.openFilePicker()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowScraperModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span>Scrape Google Maps</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </button>
          </div>
        }
      />

      <CsvImport ref={csvImportRef} onImport={fetchLeads} />

      {/* Lazy Loaded Scraper Modal */}
      {showScraperModal && (
        <Suspense fallback={null}>
          <LeadScraperModal
            open={showScraperModal}
            onClose={() => setShowScraperModal(false)}
            onImported={fetchLeads}
          />
        </Suspense>
      )}

      {/* Lazy Loaded Collection Manager Modal */}
      {showCollectionModal && (
        <Suspense fallback={null}>
          <CollectionManagerModal
            open={showCollectionModal}
            onClose={() => setShowCollectionModal(false)}
            collections={collections}
            selectedCollection={selectedCollection}
            onSelectCollection={setSelectedCollection}
            leads={leads}
          />
        </Suspense>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-9 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowCollectionModal(true)}
          className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100/60 transition-all cursor-pointer"
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>
            Collection:{" "}
            <strong>
              {selectedCollection === "all" ? "All Leads" : selectedCollection}
            </strong>
          </span>
          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">
            {filteredLeads.length}
          </span>
        </button>

        <div className="relative flex items-center">
          <Globe className="absolute left-3 h-3.5 w-3.5 text-blue-500 pointer-events-none" />
          <select
            className="h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none"
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
          >
            <option value="all">All Websites</option>
            <option value="has_website">Has Website</option>
            <option value="no_website">Missing Website</option>
          </select>
        </div>

        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-3.5 w-3.5 text-purple-500 pointer-events-none" />
          <select
            className="h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          >
            <option value="all">All Emails</option>
            <option value="has_email">Has Email</option>
            <option value="no_email">Missing Email</option>
          </select>
        </div>

        <select
          className="h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
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

      {/* Move To Collection Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-500" />
                Move to Collection
              </h3>
              <p className="text-xs text-slate-500">
                Move {selectedLeadIds.length} selected lead(s) into a folder.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Collection Name"
                value={targetCollectionInput}
                onChange={(e) => setTargetCollectionInput(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {collections.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Or pick existing:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {collections.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTargetCollectionInput(c)}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="text-xs font-semibold text-slate-500 px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveToCollection}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lazy Loaded Lead Form */}
      {showForm && (
        <Suspense fallback={<LoadingState message="Loading form..." />}>
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
        </Suspense>
      )}

      <SectionCard
        title={
          <div className="flex items-center justify-between">
            <span>
              {selectedCollection === "all"
                ? "All Leads"
                : `Collection: ${selectedCollection}`}{" "}
              ({filteredLeads.length})
            </span>
          </div>
        }
      >
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