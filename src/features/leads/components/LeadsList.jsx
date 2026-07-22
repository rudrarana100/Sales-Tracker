import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Users, Phone, User, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  cold: "bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  contacted: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  warm: "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  meeting_booked: "bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900",
  proposal_sent: "bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900",
  closed_won: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  closed_lost: "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 line-through",
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
          className="flex items-center justify-between rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 transition-all duration-150 hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors hover:text-blue-600 truncate"
              >
                {lead.lead_name}
              </h3>
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusStyles[lead.status] || "bg-slate-100 text-slate-600"}`}
              >
                {lead.status?.replace("_", " ")}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <User className="h-3 w-3 text-slate-400" />
                {lead.contact_person || "No Contact"}
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <Phone className="h-3 w-3 text-slate-400" />
                {lead.phone || "--"}
              </span>
              {lead.business_type && (
                <span className="flex items-center gap-1.5 hidden md:flex">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  {lead.business_type}
                </span>
              )}
              {lead.follow_up_date && (
                <span className="flex items-center gap-1.5 hidden lg:flex">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {lead.follow_up_date}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3 shrink-0">
            <button
              onClick={() => navigate(`/leads/${lead.id}`)}
              title="Open Lead"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  title="Delete"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the lead and its associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(lead)}
                    className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl"
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
