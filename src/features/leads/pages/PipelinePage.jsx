import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/PageHeader";
import {
  Globe,
  MapPin,
  MessageCircle,
  Copy,
  ExternalLink,
  Search,
  User,
  Phone,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";

const columnConfig = [
  { key: "contacted", label: "Contacted", color: "border-t-blue-400" },
  { key: "warm", label: "Warm", color: "border-t-amber-400" },
  { key: "meeting_booked", label: "Meeting", color: "border-t-purple-400" },
  { key: "proposal_sent", label: "Proposal", color: "border-t-indigo-400" },
  { key: "closed_won", label: "Won", color: "border-t-green-400" },
  { key: "closed_lost", label: "Lost", color: "border-t-red-400" },
];

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

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

  function reorderKanban(leads, draggableId, destinationStatus) {
    const movedLead = leads.find((lead) => String(lead.id) === draggableId);

    if (!movedLead) return leads;

    const remaining = leads.filter((lead) => String(lead.id) !== draggableId);

    return [
      {
        ...movedLead,
        status: destinationStatus,
      },
      ...remaining,
    ];
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    const labels = {
      cold: "Cold",
      contacted: "Contacted",
      warm: "Warm",
      meeting_booked: "Meeting Booked",
      proposal_sent: "Proposal Sent",
      closed_won: "Closed Won",
      closed_lost: "Closed Lost",
    };

    const previousLeads = [...leads];

    // Find dragged lead
    const movedLead = leads.find((lead) => String(lead.id) === draggableId);

    if (!movedLead) return;

    // Everything except dragged lead
    const remaining = leads.filter((lead) => String(lead.id) !== draggableId);

    // Put dragged lead at the beginning
    const updatedLeads = [
      {
        ...movedLead,
        status: destination.droppableId,
      },
      ...remaining,
    ];

    setLeads(updatedLeads);

    try {
      await updateLead(draggableId, {
        status: destination.droppableId,
      });

      await addActivity({
        lead_id: draggableId,
        activity_type: "status_change",
        description: `Moved to ${labels[destination.droppableId]}`,
      });
    } catch (error) {
      console.error(error);

      // Rollback
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

  function renderLeadCard(lead, index) {
    return (
      <Draggable draggableId={String(lead.id)} index={index} key={lead.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transitionDuration: "0.08s",
            }}
            className="mb-2 rounded-lg border border-ash bg-canvas-white p-3 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <h4 className="mb-2 text-sm font-medium text-charcoal">
              {lead.lead_name}
            </h4>
            <div className="space-y-0.5 text-xs text-fog">
              <p className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {lead.contact_person || "--"}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </p>
              <p className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {lead.business_type || "--"}
              </p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {lead.follow_up_date
                  ? new Date(lead.follow_up_date).toLocaleDateString("en-IN")
                  : "No Follow-up"}
              </p>
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lead.follow_up_time || "--"}
              </p>
            </div>
            <hr className="my-2 border-ash" />
            <div className="flex flex-wrap gap-1">
              {[
                {
                  icon: Globe,
                  title: "Website",
                  onClick: () => {
                    if (!lead.website) return;
                    let u = lead.website;
                    if (!u.startsWith("http")) u = "https://" + u;
                    window.open(u, "_blank");
                  },
                },
                {
                  icon: MapPin,
                  title: "Maps",
                  onClick: () => {
                    if (!lead.google_maps_link) return;
                    window.open(lead.google_maps_link, "_blank");
                  },
                },
                {
                  icon: MessageCircle,
                  title: "WhatsApp",
                  onClick: () => {
                    let p = lead.phone.replace(/\D/g, "");
                    if (p.length === 10) p = "91" + p;
                    window.open(`https://wa.me/${p}`, "_blank");
                  },
                },
                {
                  icon: Copy,
                  title: "Copy Phone",
                  onClick: () => {
                    navigator.clipboard.writeText(lead.phone);
                    alert("Phone copied!");
                  },
                },
                {
                  icon: ExternalLink,
                  title: "Open Lead",
                  onClick: () => navigate(`/leads/${lead.id}`),
                },
              ].map((btn, i) => (
                <Button
                  key={i}
                  size="icon-xs"
                  variant="outline"
                  title={btn.title}
                  onClick={btn.onClick}
                >
                  <btn.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-sm text-fog">
        Loading...
      </div>
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description="Drag and drop leads to update their status."
      />

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
        <Input
          placeholder="Search by lead, contact or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-8"
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
       <div className="kanban-scroll flex h-[calc(100vh-170px)] gap-3 overflow-x-auto overflow-y-hidden">
          {columnConfig.map(({ key, label, color }) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-[280px] min-w-[280px] flex-col rounded-xl border-t-4 bg-paper-mist p-3 ${color}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-charcoal">
                      {label}
                    </h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ash text-[11px] font-medium text-fog">
                      {columns[key].length}
                    </span>
                  </div>
                  <div className="column-scroll flex-1 overflow-y-auto space-y-2 pr-1">
                    {columns[key].length === 0 ? (
                      <div className="rounded-lg border border-dashed border-ash py-6 text-center text-xs text-fog">
                        No deals
                      </div>
                    ) : (
                      columns[key].map((lead, index) =>
                        renderLeadCard(lead, index),
                      )
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
