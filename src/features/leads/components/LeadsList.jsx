import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

const statusStyles = {
  cold: "bg-accent text-muted-foreground",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  warm: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  meeting_booked: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  proposal_sent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  closed_won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed_lost: "bg-red-500/10 text-red-600 dark:text-red-400",
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
      <div className="rounded-lg border border-dashed py-12 text-center">
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
          className="flex items-center justify-between rounded-lg border bg-card px-5 py-3.5 transition-all duration-150 hover:shadow-elevated"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-sm font-medium text-foreground transition hover:text-ring truncate"
              >
                {lead.lead_name}
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[lead.status] || "bg-accent text-muted-foreground"}`}
              >
                {lead.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{lead.contact_person || "No Contact"}</span>
              <span>{lead.phone || "--"}</span>
              {lead.follow_up_date && (
                <span>Follow-up: {lead.follow_up_date}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3">
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
