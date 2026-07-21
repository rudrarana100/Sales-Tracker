import { useState, useEffect } from "react";
import { createFollowUp, updateFollowUp } from "../../api/followUpsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addActivity } from "../../api/activitiesApi";
import { X, Calendar, Loader2 } from "lucide-react";
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
      setType(followUp.type);
      setDate(followUp.scheduled_date || "");
      setTime(followUp.scheduled_time || "");
      setPriority(followUp.priority || "medium");
      setNotes(followUp.notes || "");
    } else {
      setType("call");
      setDate("");
      setTime("");
      setPriority("medium");
      setNotes("");
    }
  }, [open, followUp]);

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/10 animate-scale-in mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-card-foreground">
              {followUp ? "Reschedule Follow-up" : "Schedule Follow-up"}
            </h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <select
            className="w-full h-9 rounded-2xl border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="call">Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="proposal">Proposal</option>
            <option value="custom">Custom</option>
          </select>

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

          <select
            className="w-full h-9 rounded-2xl border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <Textarea placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20 resize-none" />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : followUp ? "Update Follow-up" : "Save Follow-up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleFollowUpModal;
