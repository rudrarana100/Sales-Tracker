import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const statusStyles = {
  cold: "bg-muted text-muted-foreground border border-border/50",
  contacted: "bg-muted text-foreground border border-border/50",
  warm: "bg-primary text-primary-foreground border-0",
  meeting_booked: "bg-primary text-primary-foreground border-0",
  proposal_sent: "bg-primary text-primary-foreground border-0",
  closed_won: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white border-0",
  closed_lost: "bg-muted text-muted-foreground/60 border border-border/50 line-through",
};

export default function LeadHeader({ lead, navigate, handleLeadUpdate }) {
  return (
    <div className="card-premium p-6">
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
          className="h-8 rounded-2xl border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
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
