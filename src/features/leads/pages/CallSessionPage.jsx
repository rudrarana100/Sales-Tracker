import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import { getActivities } from "../api/activitiesApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { getNotes, addNote } from "../api/notesApi";
import { createFollowUp } from "../api/followUpsApi";
import ScheduleFollowUpModal from "../components/followups/ScheduleFollowUpModal";
import {
  Phone,
  User,
  Mail,
  Globe,
  MapPin,
  Copy,
  MessageCircle,
  Calendar,
  Video,
  SkipForward,
  PhoneOff,
  Ban,
  Shield,
  CalendarCheck,
  ThumbsDown,
  ThumbsUp,
  PhoneCall,
  Clock,
  Activity,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const statusBadge = {
  cold: { label: "Cold", class: "bg-muted text-muted-foreground border border-border/50" },
  contacted: { label: "Contacted", class: "bg-muted text-foreground border border-border/50" },
  warm: { label: "Warm", class: "bg-primary text-primary-foreground border-0" },
  meeting_booked: { label: "Meeting", class: "bg-primary text-primary-foreground border-0" },
  proposal_sent: { label: "Proposal", class: "bg-primary text-primary-foreground border-0" },
  closed_won: { label: "Won", class: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white border-0" },
  closed_lost: { label: "Lost", class: "bg-muted text-muted-foreground/60 border border-border/50 line-through" },
};

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [skippedLeadIds, setSkippedLeadIds] = useState([]);
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackReason, setCallbackReason] = useState("");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const coldLeads = leads.filter(
    (l) => l.status === "cold" && !skippedLeadIds.includes(l.id),
  );
  const currentLead = coldLeads[0];
  const totalCold = leads.filter((l) => l.status === "cold").length;
  const currentIndex = totalCold - coldLeads.length + 1;

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (currentLead) {
      getNotes(currentLead.id)
        .then((d) => setNotes(d.slice(0, 3)))
        .catch(console.error);
      getActivities(currentLead.id)
        .then((d) => setActivities(d.slice(0, 5)))
        .catch(console.error);
    }
  }, [currentLead]);

  function skipLead() {
    setSkippedLeadIds((p) => [...p, currentLead.id]);
  }

  const outcomeConfig = {
    interested: { status: "warm" },
    no_answer: { status: "cold" },
    invalid_number: { status: "closed_lost" },
    gatekeeper: { status: "cold" },
    not_interested: { status: "closed_lost" },
  };

  const outcomeDescriptions = {
    interested: "Lead marked as Interested",
    no_answer: "No answer",
    invalid_number: "Invalid phone number",
    gatekeeper: "Reached gatekeeper",
    callback_requested: "Callback requested",
    not_interested: "Lead not interested",
  };

  async function handleOutcome(outcome) {
    try {
      if (!currentLead) return;
      if (outcome === "callback_requested") {
        setCallbackReason("callback");
        setShowCallbackForm(true);
        return;
      }
      if (outcome === "interested") {
        setShowInterestedActions(true);
        return;
      }
      if (outcome === "gatekeeper") {
        setCallbackReason("gatekeeper");
        setShowCallbackForm(true);
        return;
      }

      const config = outcomeConfig[outcome];
      const updates = {
        status: config.status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      };

      await updateLead(currentLead.id, updates);

      if (outcome === "no_answer") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await createFollowUp({
          lead_id: currentLead.id,
          type: "call",
          title: "No Answer Follow-up",
          notes: "Retry call.",
          scheduled_date: tomorrow.toISOString().split("T")[0],
          scheduled_time: null,
          priority: "medium",
          status: "pending",
        });
      }

      await addActivity({
        lead_id: currentLead.id,
        activity_type: "call_outcome",
        description: outcomeDescriptions[outcome] || outcome,
      });
      setSkippedLeadIds((prev) => [...prev, currentLead.id]);
      await fetchLeads();
      setShowInterestedActions(false);
    } catch (error) {
      console.error(error);
    }
  }

  function sendWhatsapp() {
    if (!currentLead.phone) {
      toast.warning("No phone number found.");
      return;
    }
    let phone = currentLead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${currentLead.contact_person || ""},\n    Great speaking with you today!\n\nAs discussed, here's some information about BuiltStack.\n\nWe help businesses build modern websites that increase trust and help generate more leads.\n\nWould love to show you a few examples on a quick Google Meet whenever you're free.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  function markInterested() {
    setShowInterestedActions(false);
    setShowFollowUpModal(true);
  }

  async function saveCallback() {
    try {
      if (!callbackDate || !callbackTime) {
        toast.warning("Please select both date and time.");
        return;
      }
      setSaving(true);
      await updateLead(currentLead.id, {
        status: "contacted",
        last_outcome: "callback_requested",
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      await createFollowUp({
        lead_id: currentLead.id,
        type: "call",
        title: callbackReason === "gatekeeper" ? "Gatekeeper Follow-up" : "Callback",
        notes: callbackNote,
        scheduled_date: callbackDate,
        scheduled_time: callbackTime,
        priority: "medium",
        status: "pending",
      });
      if (callbackNote.trim()) {
        await addNote({ lead_id: currentLead.id, content: callbackNote.trim() });
      }
      await addActivity({
        lead_id: currentLead.id,
        activity_type: "callback",
        description: callbackReason === "gatekeeper"
          ? `Reached gatekeeper. Callback scheduled for ${callbackDate} at ${callbackTime}`
          : `Callback scheduled for ${callbackDate} at ${callbackTime}`,
      });
      setSkippedLeadIds((prev) => [...prev, currentLead.id]);
      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");
      setCallbackNote("");
      setCallbackReason("");
      await fetchLeads();
    } catch (error) {
      console.error(error);
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
        `Meeting with ${currentLead.lead_name}`,
        "BuiltStack Discovery Call",
        start.toISOString(),
        end.toISOString(),
      );
      await updateLead(currentLead.id, {
        status: "meeting_booked",
        last_outcome: "google_meet_booked",
        last_contact_date: new Date().toISOString().split("T")[0],
        meeting_link: meetLink,
      });
      await addActivity({
        lead_id: currentLead.id,
        activity_type: "meeting",
        description: `Google Meet booked for ${meetingDate} at ${meetingTime}`,
      });
      setSkippedLeadIds((prev) => [...prev, currentLead.id]);
      sendMeetingConfirmation(meetLink);
      setShowMeetingForm(false);
      setMeetingDate("");
      setMeetingTime("");
      await fetchLeads();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function sendMeetingConfirmation(meetLink) {
    if (!currentLead.phone) return;
    let phone = currentLead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${currentLead.contact_person || currentLead.lead_name},\n\nGreat speaking with you today!\n\nOur Google Meet has been scheduled.\n\n📅 Date: ${new Date(meetingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n🕒 Time: ${meetingTime}\n\nMeeting Link:\n${meetLink}\n\nLooking forward to speaking with you.\n\n- Rudra\nBuiltStack`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Session" description="Sequential cold calling workflow." />
        <div className="h-48 rounded-2xl bg-muted animate-skeleton-pulse" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 rounded-2xl bg-muted animate-skeleton-pulse" />
            <div className="h-40 rounded-2xl bg-muted animate-skeleton-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-muted animate-skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (coldLeads.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Session" description="All caught up for today." />
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <PhoneCall className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Session Complete</h2>
            <p className="mt-1 text-sm text-muted-foreground">No cold leads remaining.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const si = statusBadge[currentLead.status] || statusBadge.cold;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Session"
        description={`Lead ${currentIndex} of ${totalCold}`}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentLead.lead_name}
              </h2>
              <div className="mt-1.5 flex items-center gap-3">
                <Badge className={`${si.class} rounded-full`}>{si.label}</Badge>
                <span className="text-xs text-muted-foreground">
                  Last:{" "}
                  {currentLead.last_contact_date
                    ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })
                    : "Never"}
                </span>
              </div>
            </div>
            <span className="rounded-2xl bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {currentIndex}/{totalCold}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: User, label: "Contact", value: currentLead.contact_person },
              { icon: Phone, label: "Phone", value: currentLead.phone },
              { icon: Mail, label: "Email", value: currentLead.email },
              { icon: Globe, label: "Website", value: currentLead.website },
              { icon: MapPin, label: "Business", value: currentLead.business_type },
              { icon: Calendar, label: "Follow-up", value: currentLead.follow_up_date
                ? `${new Date(currentLead.follow_up_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ${currentLead.follow_up_time || ""}`
                : "--",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-all duration-200 hover:shadow-subtle">
                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.value || "--"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {[
              { icon: Globe, label: "Website", onClick: () => {
                if (!currentLead.website) return;
                let u = currentLead.website;
                if (!u.startsWith("http")) u = "https://" + u;
                window.open(u, "_blank");
              }},
              { icon: MapPin, label: "Maps", onClick: () => {
                if (!currentLead.google_maps_link) return;
                window.open(currentLead.google_maps_link, "_blank");
              }},
              { icon: Mail, label: "Email", onClick: () => {
                if (!currentLead.email) { toast.warning("No email found."); return; }
                window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(currentLead.email)}`, "_blank");
              }},
              { icon: Copy, label: "Copy Phone", onClick: () => {
                navigator.clipboard.writeText(currentLead.phone);
                toast.success("Phone copied!");
              }},
              { icon: MessageCircle, label: "WhatsApp", onClick: sendWhatsapp },
            ].map((btn, i) => (
              <Button key={i} size="sm" variant="outline" className="gap-1.5" onClick={btn.onClick}>
                <btn.icon className="h-4 w-4" />
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" /> Previous Interaction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`mt-0.5 ${si.class} rounded-full`}>{si.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Outcome</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-foreground">
                    {currentLead.last_outcome?.replace(/_/g, " ") || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Contact</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {currentLead.last_contact_date
                      ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Follow-up</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {currentLead.follow_up_date
                      ? `${new Date(currentLead.follow_up_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ${currentLead.follow_up_time || ""}`
                      : "--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" /> Recent Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">No notes available.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-xl border bg-card px-4 py-3">
                      <p className="text-sm text-foreground">{note.content}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <Activity className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">No activity found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ring" />
                      <div>
                        <p className="text-sm text-foreground">{a.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4" /> Call Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1.5">
                {[
                  { icon: PhoneOff, label: "No Answer", action: "no_answer" },
                  { icon: Ban, label: "Invalid Number", action: "invalid_number" },
                  { icon: Shield, label: "Gatekeeper", action: "gatekeeper" },
                  { icon: CalendarCheck, label: "Callback Requested", action: "callback_requested" },
                  { icon: ThumbsDown, label: "Not Interested", action: "not_interested" },
                  { icon: ThumbsUp, label: "Interested", action: "interested", extra: "border-primary text-primary dark:border-primary dark:text-primary" },
                ].map((btn) => (
                  <Button
                    key={btn.action}
                    variant="outline"
                    className={`w-full justify-start gap-2 ${btn.extra || ""}`}
                    onClick={() => handleOutcome(btn.action)}
                  >
                    <btn.icon className="h-4 w-4 text-muted-foreground" />
                    {btn.label}
                  </Button>
                ))}
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={skipLead}>
                  <SkipForward className="h-4 w-4 text-muted-foreground" /> Skip Lead
                </Button>
              </div>
            </CardContent>
          </Card>

          {showCallbackForm && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" /> Schedule Callback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-6">
                <Input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} />
                <Input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} />
                <Input placeholder="Notes" value={callbackNote} onChange={(e) => setCallbackNote(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveCallback} className="flex-1" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCallbackForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showMeetingForm && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Video className="h-4 w-4" /> Book Google Meet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-6">
                <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                <Input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveMeeting} className="flex-1" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                    {saving ? "Creating..." : "Confirm"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowMeetingForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showInterestedActions && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <ThumbsUp className="h-4 w-4" /> Prospect Interested
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-6">
                <Button size="sm" className="w-full" onClick={() => { sendWhatsapp(); markInterested(); }}>
                  <MessageCircle className="h-4 w-4" /> Send WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowInterestedActions(false); setShowMeetingForm(true); }}>
                  <Video className="h-4 w-4" /> Book Google Meet
                </Button>
                <Button size="sm" variant="ghost" className="w-full" onClick={() => setShowInterestedActions(false)}>
                  <XCircle className="h-4 w-4" /> Skip
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ScheduleFollowUpModal
        open={showFollowUpModal}
        lead={currentLead}
        onClose={() => setShowFollowUpModal(false)}
        onSaved={async () => {
          await updateLead(currentLead.id, {
            status: "warm",
            last_outcome: "interested",
            last_contact_date: new Date().toISOString().split("T")[0],
          });
          await addActivity({
            lead_id: currentLead.id,
            activity_type: "status_change",
            description: "Lead marked as Interested",
          });
          setSkippedLeadIds((prev) => [...prev, currentLead.id]);
          await fetchLeads();
        }}
      />
    </div>
  );
}

export default CallSessionPage;
