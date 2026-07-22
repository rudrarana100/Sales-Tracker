import { useState, useEffect } from "react";
import { createFollowUp, updateFollowUp } from "../../api/followUpsApi";
import { addActivity } from "../../api/activitiesApi";
import { X, Calendar, Loader2, Phone, MessageCircle, Mail, Video, FileText } from "lucide-react";
import { toast } from "sonner";

function ScheduleFollowUpModal({ lead, followUp = null, open, onClose, onSaved }) {
  const [type, setType] = useState("call");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (followUp) {
      setType(followUp.type || "call");
      setDate(followUp.scheduled_date || "");
      setTime(followUp.scheduled_time || "");
      setPriority(followUp.priority || "medium");
      setNotes(followUp.notes || "");
    } else {
      setType("call");
      const todayStr = new Date().toISOString().split("T")[0];
      setDate(todayStr);
      setTime("10:00");
      setPriority("medium");
      setNotes("");
    }
  }, [open, followUp]);

  if (!open) return null;

  function setDatePreset(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDate(d.toISOString().split("T")[0]);
  }

  async function handleSave() {
    if (!date) {
      toast.warning("Please select a follow-up date.");
      return;
    }
    setSaving(true);

    const payload = {
      lead_id: lead.id,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Follow-up`,
      notes,
      scheduled_date: date,
      scheduled_time: time || null,
      priority,
      status: "pending",
    };

    try {
      if (followUp) {
        await updateFollowUp(followUp.id, payload);
        await addActivity({
          lead_id: lead.id,
          activity_type: "follow_up_rescheduled",
          description: `Rescheduled follow-up to ${date}${time ? ` ${time}` : ""}`,
        });
      } else {
        await createFollowUp(payload);
      }
      onSaved?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(followUp ? "Failed to update follow-up." : "Failed to create follow-up.");
    } finally {
      setSaving(false);
    }
  }

  const followUpTypes = [
    { id: "call", label: "Phone Call", icon: Phone },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "email", label: "Email", icon: Mail },
    { id: "meeting", label: "Google Meet", icon: Video },
    { id: "proposal", label: "Proposal", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {followUp ? "Reschedule Follow-up" : "Schedule Follow-up"}
              </h2>
              <p className="text-[11px] text-slate-400">For {lead?.lead_name || "Lead"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Follow-up Type selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Follow-up Type</label>
            <div className="grid grid-cols-3 gap-2">
              {followUpTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white border-transparent shadow-xs"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</label>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <button type="button" onClick={() => setDatePreset(0)} className="hover:text-blue-600 dark:hover:text-blue-400">Today</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setDatePreset(1)} className="hover:text-blue-600 dark:hover:text-blue-400">Tomorrow</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setDatePreset(2)} className="hover:text-blue-600 dark:hover:text-blue-400">+2 Days</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setDatePreset(7)} className="hover:text-blue-600 dark:hover:text-blue-400">Next Week</button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
            />
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</label>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <button type="button" onClick={() => setTime("09:00")} className="hover:text-blue-600 dark:hover:text-blue-400">9 AM</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setTime("11:00")} className="hover:text-blue-600 dark:hover:text-blue-400">11 AM</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setTime("14:00")} className="hover:text-blue-600 dark:hover:text-blue-400">2 PM</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setTime("16:00")} className="hover:text-blue-600 dark:hover:text-blue-400">4 PM</button>
                <span>&middot;</span>
                <button type="button" onClick={() => setTime("18:00")} className="hover:text-blue-600 dark:hover:text-blue-400">6 PM</button>
              </div>
            </div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Level</label>
            <select
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority 🔥</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes & Objectives</label>
            <textarea
              placeholder="What needs to be discussed or sent during this follow-up..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-bold shadow-xs transition-all"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{saving ? "Saving..." : followUp ? "Update Schedule" : "Save Follow-up"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleFollowUpModal;

