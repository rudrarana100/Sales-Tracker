import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import {
  Globe, MapPin, MessageCircle, Copy, ExternalLink, Search,
  Phone, Building2, Calendar, KanbanSquare, Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const columnConfig = [
  {
    key: "contacted",
    label: "Contacted",
    dotColor: "bg-blue-500",
    badgeStyle: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50",
  },
  {
    key: "warm",
    label: "Warm Lead",
    dotColor: "bg-amber-500",
    badgeStyle: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50",
  },
  {
    key: "meeting_booked",
    label: "Meeting Booked",
    dotColor: "bg-purple-500",
    badgeStyle: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/50",
  },
  {
    key: "proposal_sent",
    label: "Proposal Sent",
    dotColor: "bg-indigo-500",
    badgeStyle: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50",
  },
  {
    key: "closed_won",
    label: "Closed Won",
    dotColor: "bg-emerald-500",
    badgeStyle: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50",
  },
  {
    key: "closed_lost",
    label: "Closed Lost",
    dotColor: "bg-rose-500",
    badgeStyle: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50",
  },
];

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchLeads(); }, []);

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

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const labels = {
      cold: "Cold", contacted: "Contacted", warm: "Warm",
      meeting_booked: "Meeting Booked", proposal_sent: "Proposal Sent",
      closed_won: "Closed Won", closed_lost: "Closed Lost",
    };

    const previousLeads = [...leads];
    const movedLead = leads.find((lead) => String(lead.id) === draggableId);
    if (!movedLead) return;
    const remaining = leads.filter((lead) => String(lead.id) !== draggableId);
    const updatedLeads = [{ ...movedLead, status: destination.droppableId }, ...remaining];
    setLeads(updatedLeads);

    try {
      await updateLead(draggableId, { status: destination.droppableId });
      await addActivity({
        lead_id: draggableId,
        activity_type: "status_change",
        description: `Moved to ${labels[destination.droppableId]}`,
      });
    } catch (error) {
      console.error(error);
      setLeads(previousLeads);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const s = searchTerm.toLowerCase();
    return (
      lead.lead_name?.toLowerCase().includes(s) ||
      lead.contact_person?.toLowerCase().includes(s) ||
      lead.phone?.includes(s)
    );
  });

  const columns = {
    contacted: filteredLeads.filter((l) => l.status === "contacted"),
    warm: filteredLeads.filter((l) => l.status === "warm"),
    meeting_booked: filteredLeads.filter((l) => l.status === "meeting_booked"),
    proposal_sent: filteredLeads.filter((l) => l.status === "proposal_sent"),
    closed_won: filteredLeads.filter((l) => l.status === "closed_won"),
    closed_lost: filteredLeads.filter((l) => l.status === "closed_lost"),
  };

  function getInitials(name) {
    if (!name) return "L";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  function renderLeadCard(lead, index) {
    const initials = getInitials(lead.lead_name);

    return (
      <Draggable draggableId={String(lead.id)} index={index} key={lead.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transitionDuration: "0.08s",
            }}
            className={`group relative mb-3 rounded-2xl border bg-card p-4 transition-all duration-200 ${
              snapshot.isDragging
                ? "shadow-2xl border-blue-500 dark:border-blue-400 rotate-1 scale-[1.02] z-50 ring-2 ring-blue-500/20"
                : "border-slate-200/80 dark:border-slate-800 shadow-[0_2px_6px_rgba(15,23,42,0.02)] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
            }`}
          >
            {/* Top Card Header */}
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="text-xs font-bold text-card-foreground hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate transition-colors"
                  >
                    {lead.lead_name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {lead.contact_person || "No contact name"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                title="Open lead details"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Middle Metadata Chips */}
            <div className="space-y-1.5 pt-1 text-[11px] font-medium text-muted-foreground">
              {lead.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{lead.phone}</span>
                </div>
              )}
              {lead.business_type && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{lead.business_type}</span>
                </div>
              )}
              {lead.follow_up_date && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                  <Calendar className="h-3 w-3 shrink-0 text-blue-500" />
                  <span>{lead.follow_up_date} {lead.follow_up_time || ""}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {lead.website && (
                  <button
                    title="Website"
                    onClick={() => {
                      let u = lead.website;
                      if (!u.startsWith("http")) u = "https://" + u;
                      window.open(u, "_blank");
                    }}
                    className="p-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Globe className="h-3 w-3" />
                  </button>
                )}
                {lead.google_maps_link && (
                  <button
                    title="Maps"
                    onClick={() => window.open(lead.google_maps_link, "_blank")}
                    className="p-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                  </button>
                )}
                <button
                  title="WhatsApp"
                  onClick={() => {
                    let p = (lead.phone || "").replace(/\D/g, "");
                    if (p.length === 10) p = "91" + p;
                    window.open(`https://wa.me/${p}`, "_blank");
                  }}
                  className="p-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                </button>
                <button
                  title="Copy Phone"
                  onClick={() => {
                    navigator.clipboard.writeText(lead.phone);
                    toast.success("Phone copied!");
                  }}
                  className="p-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID #{lead.id}
              </span>
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pipeline" description="Drag and drop deals across stages." />
        <div className="flex gap-4 overflow-x-auto">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="w-[290px] min-w-[290px] h-[550px] rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeDealsCount = leads.filter((l) => l.status !== "cold").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description={`Active management for ${activeDealsCount} deals across stages.`}
        action={
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Lead</span>
          </button>
        }
      />

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-slate-200/70 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search deals by name, contact, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-xs text-card-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>{filteredLeads.length} Total Deals</span>
          </span>
        </div>
      </div>

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-scroll flex h-[calc(100vh-230px)] gap-4 overflow-x-auto overflow-y-hidden pb-4">
          {columnConfig.map(({ key, label, dotColor, badgeStyle }) => (
            <Droppable droppableId={key} key={key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-[290px] min-w-[290px] flex-col rounded-2xl border bg-slate-50/50 dark:bg-slate-900/40 p-3 transition-all duration-200 ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50/60 dark:bg-slate-800/60 border-blue-400/80 shadow-md"
                      : "border-slate-200/70 dark:border-slate-800/80"
                  }`}
                >
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between px-1.5 py-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                      <h3 className="text-xs font-bold text-card-foreground uppercase tracking-wider">
                        {label}
                      </h3>
                    </div>
                    <span className={`flex h-5 items-center justify-center rounded-lg px-2 text-[10px] font-bold ${badgeStyle}`}>
                      {columns[key].length}
                    </span>
                  </div>

                  {/* Cards Scroll Area */}
                  <div className="column-scroll flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                    {columns[key].length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 py-14 text-center">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <KanbanSquare className="h-4 w-4" />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400">No deals in this stage</p>
                      </div>
                    ) : (
                      columns[key].map((lead, index) => renderLeadCard(lead, index))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default PipelinePage;


