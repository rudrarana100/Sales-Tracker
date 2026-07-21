import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  cold: "bg-paper text-fog border border-border",
  contacted: "bg-paper text-graphite border border-border",
  warm: "bg-paper text-graphite border border-border font-medium",
  meeting_booked: "bg-obsidian text-snow border border-obsidian",
  proposal_sent: "bg-obsidian text-snow border border-obsidian",
  closed_won: "bg-ember text-snow border border-ember",
  closed_lost: "bg-paper text-fog border border-border line-through",
};

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function LeadsList({ leads, onStatusChange }) {
  const navigate = useNavigate();

  async function handleDelete(lead) {
    try {
      await deleteLead(lead.id);

      toast.success("Lead deleted successfully");

      await onStatusChange();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete lead");
    }
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground">No Leads Found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try changing your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 transition-all duration-150 hover:shadow-md"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-sm font-medium text-card-foreground transition-colors hover:text-foreground/80 truncate"
              >
                {lead.lead_name}
              </h3>
              <span
                className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[lead.status] || "bg-muted text-muted-foreground"}`}
              >
                {lead.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{lead.contact_person || "No Contact"}</span>
              <span className="hidden sm:inline">{lead.phone || "--"}</span>
              {lead.follow_up_date && (
                <span className="hidden sm:inline">Follow-up: {lead.follow_up_date}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3 shrink-0">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => navigate(`/leads/${lead.id}`)}
              title="Open Lead"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  title="Delete"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the lead and its associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction
                    onClick={() => handleDelete(lead)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;
