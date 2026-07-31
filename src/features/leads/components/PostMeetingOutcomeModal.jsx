import { useState } from "react";
import { processMeetingOutcome, MEETING_OUTCOME_MAPPINGS} from "@/utils/meetingOutcomes";
import { X, CheckCircle, UserX, Clock, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PostMeetingOutcomeModal({ lead, open, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);

  if (!open || !lead) return null;

  async function handleAction(outcomeKey) {
    setSaving(true);
    try {
      await processMeetingOutcome(lead, outcomeKey);
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update meeting outcome.");
    } finally {
      setSaving(false);
    }
  }

  const icons = {
    closed: CheckCircle,
    follow_up: Clock,
    ghosted: UserX,
    rescheduled: RotateCcw
  };

  const styles = {
    closed: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
    follow_up: "border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-800 dark:text-blue-300",
    ghosted: "border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300",
    rescheduled: "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Post-Meeting Outcome</h3>
            <p className="text-[11px] text-slate-400">Select what happened with {lead.lead_name || "this lead"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {saving ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Updating lead record...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {Object.keys(MEETING_OUTCOME_MAPPINGS).map((key) => {
              const config = MEETING_OUTCOME_MAPPINGS[key];
              const IconComponent = icons[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAction(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left font-semibold text-xs ${styles[key]}`}
                >
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <div>
                    <p>{config.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}