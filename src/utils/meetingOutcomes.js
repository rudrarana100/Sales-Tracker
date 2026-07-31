import { updateLead } from "@/features/leads/api/leadsApi";
import { addActivity } from "@/features/leads/api/activitiesApi";
import { toast } from "sonner";

export const MEETING_OUTCOME_MAPPINGS = {
  closed: { status: "closed_won", last_outcome: "deal_closed", label: "Deal Closed / Won" },
  ghosted: { status: "closed_lost", last_outcome: "client_ghosted", label: "Ghosted / Lost" },
  follow_up: { status: "warm", last_outcome: "needs_follow_up", label: "Needs Follow-up" },
  rescheduled: { status: "meeting_booked", last_outcome: "rescheduled_meeting", label: "Reschedule Meeting" }
};

export async function processMeetingOutcome(lead, outcome, options = { sendWhatsApp: true }) {
  if (!lead || !lead.id) {
    throw new Error("Invalid lead provided to processMeetingOutcome");
  }

  const outcomeConfig = MEETING_OUTCOME_MAPPINGS[outcome];
  if (!outcomeConfig) {
    throw new Error(`Invalid outcome type: ${outcome}`);
  }

  const updateData = {
    status: outcomeConfig.status,
    last_outcome: outcomeConfig.last_outcome
  };

  // 1. Update backend database
  await updateLead(lead.id, updateData);

  // 2. Log activity timeline
  await addActivity({
    lead_id: lead.id,
    activity_type: "meeting_outcome",
    description: `Meeting outcome logged: ${outcomeConfig.label}`
  });

  // 3. Optional automated WhatsApp re-engagement trigger
  if (options.sendWhatsApp && lead?.phone) {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    if (cleanPhone) {
      let message = "";
      const meetLink = lead.meeting_link || "https://meet.google.com/new";

      if (outcome === "ghosted") {
        message = `Hi ${lead.lead_name || "there"}, tried reaching out regarding our scheduled session. Let me know if you would still like to connect.`;
      } else if (outcome === "follow_up") {
        message = `Hi ${lead.lead_name || "there"}, following up on our recent discussion. Are you ready to move forward?`;
      } else if (outcome === "closed") {
        message = `Hi ${lead.lead_name || "there"}, thrilled to have you on board! Let us get started with the next steps.`;
      } else if (outcome === "rescheduled") {
        message = `Hi ${lead.lead_name || "there"}, I understand we need to reschedule our session. Here is the Google Meet link for when we reconnect:\n\n🔗 ${meetLink}\n\nPlease let me know your preferred date and time, and we will get it locked in.`;
      }

      if (message) {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
      }
    }
  }

  toast.success(`Outcome logged: ${outcomeConfig.label}`);
  return outcomeConfig;
}