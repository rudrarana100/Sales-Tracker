import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const statusColors = {
  cold: "bg-slate-200 text-slate-800",
  contacted: "bg-blue-100 text-blue-700",
  warm: "bg-amber-100 text-amber-700",
  meeting_booked: "bg-violet-100 text-violet-700",
  proposal_sent: "bg-cyan-100 text-cyan-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

export default function LeadHeader({
  lead,
  navigate,
  handleLeadUpdate,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8">
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/leads")}
            className="mb-5 px-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>

          <h1 className="text-4xl font-semibold tracking-tight">
            {lead.lead_name}
          </h1>

          <p className="mt-2 text-zinc-500">
            {lead.contact_person || "No contact person"}
          </p>
        </div>

        <Badge
          className={`${statusColors[lead.status]} capitalize rounded-full px-4 py-1`}
        >
          {lead.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-sm font-medium text-zinc-500">
          Lead Status
        </label>

        <select
          className="h-11 w-64 rounded-xl border border-zinc-200 bg-white px-4"
          value={lead.status}
          onChange={(e) =>
            handleLeadUpdate({
              status: e.target.value,
            })
          }
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