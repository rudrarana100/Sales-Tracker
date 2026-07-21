import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Users, Phone, User, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  cold: "bg-muted text-muted-foreground border border-border/50",
  contacted: "bg-muted text-foreground border border-border/50",
  warm: "bg-primary text-primary-foreground",
  meeting_booked: "bg-primary text-primary-foreground",
  proposal_sent: "bg-primary text-primary-foreground",
  closed_won: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white",
  closed_lost: "bg-muted text-muted-foreground/60 border border-border/50 line-through",
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Users className="h-6 w-6 text-muted-foreground/60" />
        </div>
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
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-all duration-200 hover:shadow-md hover:border-foreground/10"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-sm font-semibold text-card-foreground transition-colors hover:text-foreground/80 truncate"
              >
                {lead.lead_name}
              </h3>
              <span
                className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[lead.status] || "bg-muted text-muted-foreground"}`}
              >
                {lead.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {lead.contact_person || "No Contact"}
              </span>
              <span className="flex items-center gap-1 hidden sm:flex">
                <Phone className="h-3 w-3" />
                {lead.phone || "--"}
              </span>
              {lead.business_type && (
                <span className="flex items-center gap-1 hidden md:flex">
                  <Building2 className="h-3 w-3" />
                  {lead.business_type}
                </span>
              )}
              {lead.follow_up_date && (
                <span className="flex items-center gap-1 hidden lg:flex">
                  <Calendar className="h-3 w-3" />
                  {lead.follow_up_date}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/leads/${lead.id}`)}
              title="Open Lead"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
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
