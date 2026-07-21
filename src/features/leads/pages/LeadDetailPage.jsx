import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById, updateLead, getDealByLeadId, createDeal } from "../api/leadsApi";
import ActivityTimeline from "../components/ActivityTimeline";
import NotesPanel from "../components/NotesPanel";
import { addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import LeadHeader from "../components/lead-detail/LeadHeader";
import ContactCard from "../components/lead-detail/ContactCard";
import QuickActionsCard from "../components/lead-detail/QuickActionsCard";
import ScheduleCard from "../components/lead-detail/ScheduleCard";
import NotesCard from "../components/lead-detail/NotesCard";
import TimelineCard from "../components/lead-detail/TimelineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LeadDetailSkeleton from "@/components/loaders/LeadDetailSkeleton";

function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [timelineRefresh, setTimelineRefresh] = useState(0);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  async function fetchLead() {
    try {
      const data = await getLeadById(id);
      setLead(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLeadUpdate(values) {
    try {
      await updateLead(lead.id, values);
      if (values.status === "closed_won") {
        const existingDeal = await getDealByLeadId(lead.id);
        if (!existingDeal) {
          await createDeal({
            lead_id: lead.id,
            deal_name: lead.lead_name,
            value: 0,
            close_date: new Date().toISOString().split("T")[0],
            payment_status: "pending",
            invoice_status: "not_sent",
            notes: "",
          });
        }
      }
      if (values.status) {
        const statusLabels = {
          cold: "Cold",
          contacted: "Contacted",
          warm: "Warm",
          meeting_booked: "Meeting Booked",
          proposal_sent: "Proposal Sent",
          closed_won: "Closed Won",
          closed_lost: "Closed Lost",
        };
        await addActivity({
          lead_id: lead.id,
          activity_type: "status_change",
          description: `Status changed to ${statusLabels[values.status]}`,
        });
      }
      await fetchLead();
      setTimelineRefresh((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveFollowUp() {
    if (!followUpDate) {
      toast.warning("Please select a date.");
      return;
    }
    setSaving(true);
    try {
      await updateLead(lead.id, {
        follow_up_date: followUpDate,
        follow_up_time: followUpTime,
      });
      const formattedDate = new Date(followUpDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
      const formattedTime = followUpTime
        ? new Date(`2000-01-01T${followUpTime}`).toLocaleTimeString("en-IN", {
            hour: "numeric", minute: "2-digit", hour12: true,
          })
        : "";
      await addActivity({
        lead_id: lead.id,
        activity_type: "follow_up",
        description: `Follow-up scheduled for ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ""}`,
      });
      await fetchLead();
      setTimelineRefresh((prev) => prev + 1);
      setFollowUpDate("");
      setFollowUpTime("");
      setShowFollowUpForm(false);
      toast.success("Follow-up saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save follow-up");
    } finally {
      setSaving(false);
    }
  }

  async function saveMeeting() {
    try {
      if (!meetingDate || !meetingTime) {
        toast.warning("Please select both date and time.");
        return;
      }
      setSaving(true);
      const start = new Date(`${meetingDate}T${meetingTime}`);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const meetLink = await createGoogleMeet(
        `BuiltStack x ${lead.lead_name}`,
        `Google Meet with ${lead.lead_name}`,
        start.toISOString(),
        end.toISOString(),
      );
      await updateLead(lead.id, {
        status: "meeting_booked",
        meeting_link: meetLink,
        follow_up_date: meetingDate,
        follow_up_time: meetingTime,
      });
      await addActivity({
        lead_id: lead.id,
        activity_type: "status_change",
        description: "Status changed to Meeting Booked",
      });
      sendMeetingConfirmation(meetLink);
      const formattedDate = new Date(meetingDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
      const formattedTime = new Date(`2000-01-01T${meetingTime}`).toLocaleTimeString("en-IN", {
        hour: "numeric", minute: "2-digit", hour12: true,
      });
      await addActivity({
        lead_id: lead.id,
        activity_type: "meeting",
        description: `Google Meet booked for ${formattedDate} at ${formattedTime}`,
      });
      await fetchLead();
      setTimelineRefresh((prev) => prev + 1);
      setMeetingDate("");
      setMeetingTime("");
      setShowMeetingForm(false);
      toast.success("Meeting created!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create meeting.");
    } finally {
      setSaving(false);
    }
  }

  function sendMeetingConfirmation(meetLink) {
    if (!lead.phone) {
      toast.warning("No phone number found.");
      return;
    }
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const formattedDate = new Date(meetingDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
    const formattedTime = new Date(`2000-01-01T${meetingTime}`).toLocaleTimeString("en-IN", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
    const message = `Hi ${lead.contact_person || lead.lead_name},\n\nGreat speaking with you!\n\nOur Google Meet has been scheduled.\n\n📅 Date: ${formattedDate}\n🕒 Time: ${formattedTime}\n\nMeeting Link:\n${meetLink}\n\nLooking forward to speaking with you.\n\n- Rudra\nBuiltStack`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  function copyPhone() {
    if (!lead.phone) return;
    navigator.clipboard.writeText(lead.phone);
    toast.success("Phone copied!");
  }

  function copyWebsite() {
    if (!lead.website) return;
    navigator.clipboard.writeText(lead.website);
    toast.success("Website copied!");
  }

  function sendEmail() {
    if (!lead.email) return;
    window.location.href = `mailto:${lead.email}`;
  }

  function sendWhatsapp() {
    if (!lead.phone) return;
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const message = `Hi ${lead.contact_person || lead.lead_name},\n\nGreat speaking with you!\n\nI'd love to show you how BuiltStack can help your business grow.\n\nLet me know a suitable time for a quick Google Meet.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

if (!lead) {
  return (
    <div className="mx-auto max-w-3xl">
      <LeadDetailSkeleton />
    </div>
  );
}

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <LeadHeader
        lead={lead}
        navigate={navigate}
        handleLeadUpdate={handleLeadUpdate}
      />
      <ContactCard lead={lead} />
      <QuickActionsCard
        lead={lead}
        copyPhone={copyPhone}
        copyWebsite={copyWebsite}
        sendEmail={sendEmail}
        sendWhatsapp={sendWhatsapp}
        setShowMeetingForm={setShowMeetingForm}
      />

      {showMeetingForm && (
        <Card className="border-ring/20">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Video className="h-4 w-4 text-ring" />
              Book Google Meet
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowMeetingForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <Input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
            <Input
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveMeeting} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Creating..." : "Create Meeting"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMeetingForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showFollowUpForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Schedule Follow-up
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowFollowUpForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
            <Input
              type="time"
              value={followUpTime}
              onChange={(e) => setFollowUpTime(e.target.value)}
            />
            <Button size="sm" onClick={saveFollowUp} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Follow-up"}
            </Button>
          </CardContent>
        </Card>
      )}

      <ScheduleCard
        lead={lead}
        setShowFollowUpForm={setShowFollowUpForm}
        setFollowUpDate={setFollowUpDate}
        setFollowUpTime={setFollowUpTime}
        setShowMeetingForm={setShowMeetingForm}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <NotesCard
          leadId={lead.id}
          setTimelineRefresh={setTimelineRefresh}
          NotesPanel={NotesPanel}
        />
        <TimelineCard
          leadId={lead.id}
          refreshTrigger={timelineRefresh}
          ActivityTimeline={ActivityTimeline}
        />
      </div>
    </div>
  );
}

export default LeadDetailPage;
