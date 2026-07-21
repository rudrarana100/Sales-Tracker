import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const statusStyles = {
  cold: "bg-paper text-fog border border-border",
  contacted: "bg-paper text-graphite border border-border",
  warm: "bg-paper text-graphite border border-border font-medium",
  meeting_booked: "bg-obsidian text-snow border border-obsidian",
  proposal_sent: "bg-obsidian text-snow border border-obsidian",
  closed_won: "bg-ember text-snow border border-ember",
  closed_lost: "bg-paper text-fog border border-border line-through",
};

export default function LeadHeader({ lead, navigate, handleLeadUpdate }) {
  return (
    <div className="card-hairline p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/leads")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Leads
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
            {lead.lead_name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lead.contact_person || "No contact person"}
          </p>
        </div>
        <Badge className={`${statusStyles[lead.status] || 'bg-muted text-muted-foreground'} capitalize rounded-xl px-3`}>
          {lead.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Status:</span>
        <select
          value={lead.status}
          onChange={(e) => handleLeadUpdate({ status: e.target.value })}
          className="h-8 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
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
