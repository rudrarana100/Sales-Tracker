import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

const statusStyles = {
  cold: "bg-blue-50 text-blue-600",
  contacted: "bg-amber-50 text-amber-600",
  warm: "bg-orange-50 text-orange-600",
  meeting_booked: "bg-purple-50 text-purple-600",
  proposal_sent: "bg-indigo-50 text-indigo-600",
  closed_won: "bg-green-50 text-green-600",
  closed_lost: "bg-red-50 text-red-600",
};

function LeadsList({ leads, onStatusChange }) {
  const navigate = useNavigate();

  async function handleDelete(lead) {
    try {
      if (!window.confirm(`Are you sure you want to delete "${lead.lead_name}"`)) return;
      await deleteLead(lead.id);
      await onStatusChange();
    } catch (error) {
      console.error(error);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ash py-12 text-center">
        <p className="text-sm font-medium text-charcoal">No Leads Found</p>
        <p className="mt-1 text-xs text-fog">Try changing your search or filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="flex items-center justify-between rounded-lg border border-ash bg-canvas-white px-4 py-3 transition hover:border-smoke"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-sm font-medium text-charcoal transition hover:text-electric-blue truncate"
              >
                {lead.lead_name}
              </h3>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles[lead.status] || 'bg-paper-mist text-fog'}`}>
                {lead.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-fog">
              <span>{lead.contact_person || "No Contact"}</span>
              <span>{lead.phone || "--"}</span>
              {lead.follow_up_date && (
                <span>Follow-up: {lead.follow_up_date}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-3">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => navigate(`/leads/${lead.id}`)}
              title="Open Lead"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => handleDelete(lead)}
              title="Delete"
              className="text-fog hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;
