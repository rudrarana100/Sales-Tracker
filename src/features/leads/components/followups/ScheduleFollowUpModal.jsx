import { useState, useEffect } from "react";
import { createFollowUp, updateFollowUp } from "../../api/followUpsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addActivity } from "../../api/activitiesApi";
import { X } from "lucide-react";

function ScheduleFollowUpModal({
  lead,
  followUp = null,
  open,
  onClose,
  onSaved,
}) {
  const [type, setType] = useState("call");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

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
    alert("Please select a follow-up date.");
    return;
  }

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
    alert(
      followUp
        ? "Failed to update follow-up."
        : "Failed to create follow-up."
    );
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-modal animate-slide-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {followUp ? "Reschedule Follow-up" : "Schedule Follow-up"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <select
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
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

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <select
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <textarea
            className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSave}>
              {followUp ? "Update Follow-up" : "Save Follow-up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleFollowUpModal;
