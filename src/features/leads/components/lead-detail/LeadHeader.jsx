import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const statusStyles = {
  cold: "bg-accent text-muted-foreground",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  warm: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  meeting_booked: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  proposal_sent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  closed_won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed_lost: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function LeadHeader({ lead, navigate, handleLeadUpdate }) {
  return (
    <div className="premium-card p-6">
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {lead.lead_name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lead.contact_person || "No contact person"}
          </p>
        </div>
        <Badge className={`${statusStyles[lead.status] || 'bg-accent text-muted-foreground'} capitalize rounded-full px-3`}>
          {lead.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Status:</span>
        <select
          value={lead.status}
          onChange={(e) => handleLeadUpdate({ status: e.target.value })}
          className="h-8 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
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
