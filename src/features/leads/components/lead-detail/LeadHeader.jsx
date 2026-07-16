import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const statusStyles = {
  cold: "bg-blue-50 text-blue-600",
  contacted: "bg-amber-50 text-amber-600",
  warm: "bg-orange-50 text-orange-600",
  meeting_booked: "bg-purple-50 text-purple-600",
  proposal_sent: "bg-indigo-50 text-indigo-600",
  closed_won: "bg-green-50 text-green-600",
  closed_lost: "bg-red-50 text-red-600",
};

export default function LeadHeader({ lead, navigate, handleLeadUpdate }) {
  return (
    <div className="rounded-xl border border-ash bg-canvas-white p-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/leads")}
        className="mb-4 -ml-1"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Leads
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-charcoal">
            {lead.lead_name}
          </h1>
          <p className="mt-0.5 text-sm text-fog">
            {lead.contact_person || "No contact person"}
          </p>
        </div>
        <Badge className={`${statusStyles[lead.status] || 'bg-paper-mist text-fog'} capitalize rounded-full px-3`}>
          {lead.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs text-fog">Status:</span>
        <select
          value={lead.status}
          onChange={(e) => handleLeadUpdate({ status: e.target.value })}
          className="h-7 rounded-md border border-ash bg-canvas-white px-2 text-sm text-charcoal outline-none"
        >
          <option value="cold">Cold</option>
          <option value="contacted">Contacted</option>
          <option value="warm">Warm</option>
          <option value="meeting_booked">Meeting Booked</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
        </select>
      </div>
    </div>
  );
}
