import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import { getActivities } from "../api/activitiesApi";
import SectionCard from "@/components/common/SectionCard";
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
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const statusBadge = {
  cold: { label: "Cold", class: "bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  contacted: { label: "Contacted", class: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" },
  warm: { label: "Warm", class: "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
  meeting_booked: { label: "Meeting", class: "bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900" },
  proposal_sent: { label: "Proposal", class: "bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900" },
  closed_won: { label: "Won", class: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900" },
  closed_lost: { label: "Lost", class: "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 line-through" },
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
    if (currentLead) setSkippedLeadIds((p) => [...p, currentLead.id]);
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
    const msg = `Hi ${currentLead.contact_person || ""},\nGreat speaking with you today!`;
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
    const msg = `Hi ${currentLead.contact_person || currentLead.lead_name},\n\nOur Google Meet has been scheduled.\n📅 Date: ${meetingDate}\n🕒 Time: ${meetingTime}\nLink: ${meetLink}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Session" description="Sequential cold calling workflow." />
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (coldLeads.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Session" description="All caught up for today." />
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <PhoneCall className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Session Complete</h2>
          <p className="mt-0.5 text-xs text-slate-400">No cold leads remaining to call.</p>
        </div>
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

      {/* Main Active Lead Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentLead.lead_name}
            </h2>
            <div className="mt-1 flex items-center gap-3">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold capitalize ${si.class}`}>
                {si.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Last Contact: {currentLead.last_contact_date ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Never"}
              </span>
            </div>
          </div>
          <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            {currentIndex} / {totalCold}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {[
            { icon: User, label: "Contact Person", value: currentLead.contact_person },
            { icon: Phone, label: "Phone Number", value: currentLead.phone },
            { icon: Mail, label: "Email", value: currentLead.email },
            { icon: Globe, label: "Website", value: currentLead.website },
            { icon: MapPin, label: "Business Type", value: currentLead.business_type },
            { icon: Calendar, label: "Follow-up", value: currentLead.follow_up_date ? `${currentLead.follow_up_date} ${currentLead.follow_up_time || ""}` : "--" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
              <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.value || "--"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Link Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
            <button
              key={i}
              onClick={btn.onClick}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
            >
              <btn.icon className="h-3.5 w-3.5 text-slate-400" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 columns: Previous notes & Activity */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title={<span className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Previous Interaction</span>}>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold capitalize mt-1 ${si.class}`}>{si.label}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Last Outcome</p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100 capitalize">{currentLead.last_outcome?.replace(/_/g, " ") || "--"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Last Contact</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{currentLead.last_contact_date ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN") : "--"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Next Follow-up</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{currentLead.follow_up_date || "--"}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={<span className="flex items-center gap-2"><FileText className="h-4 w-4 text-purple-500" /> Recent Notes</span>}>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No notes available.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3">
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{note.content}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(note.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={<span className="flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-500" /> Recent Activity</span>}>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No activity recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{a.description}</p>
                      <p className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right 1 column: Outcomes Panel */}
        <div className="space-y-4">
          <SectionCard title={<span className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-500" /> Call Outcome</span>}>
            <div className="space-y-2">
              {[
                { icon: PhoneOff, label: "No Answer", action: "no_answer" },
                { icon: Ban, label: "Invalid Number", action: "invalid_number" },
                { icon: Shield, label: "Gatekeeper", action: "gatekeeper" },
                { icon: CalendarCheck, label: "Callback Requested", action: "callback_requested" },
                { icon: ThumbsDown, label: "Not Interested", action: "not_interested" },
                { icon: ThumbsUp, label: "Interested", action: "interested", primary: true },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleOutcome(btn.action)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all border ${
                    btn.primary
                      ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 border-transparent shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <btn.icon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{btn.label}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
              <button
                onClick={skipLead}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all mt-2"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip Lead
              </button>
            </div>
          </SectionCard>

          {showCallbackForm && (
            <SectionCard title="Schedule Callback">
              <div className="space-y-2.5">
                <input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200" />
                <input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200" />
                <input placeholder="Notes" value={callbackNote} onChange={(e) => setCallbackNote(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200" />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCallback} disabled={saving} className="flex-1 rounded-xl bg-slate-900 text-white py-2 text-xs font-bold">
                    {saving ? "Saving..." : "Save Callback"}
                  </button>
                  <button onClick={() => setShowCallbackForm(false)} className="rounded-xl border border-slate-200 px-3 text-xs font-semibold">Cancel</button>
                </div>
              </div>
            </SectionCard>
          )}

          {showMeetingForm && (
            <SectionCard title="Book Google Meet">
              <div className="space-y-2.5">
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200" />
                <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200" />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveMeeting} disabled={saving} className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-xs font-bold">
                    {saving ? "Creating..." : "Confirm Meeting"}
                  </button>
                  <button onClick={() => setShowMeetingForm(false)} className="rounded-xl border border-slate-200 px-3 text-xs font-semibold">Cancel</button>
                </div>
              </div>
            </SectionCard>
          )}

          {showInterestedActions && (
            <SectionCard title="Prospect Interested">
              <div className="space-y-2">
                <button onClick={() => { sendWhatsapp(); markInterested(); }} className="w-full rounded-xl bg-emerald-600 text-white py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Send WhatsApp
                </button>
                <button onClick={() => { setShowInterestedActions(false); setShowMeetingForm(true); }} className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Book Google Meet
                </button>
                <button onClick={() => setShowInterestedActions(false)} className="w-full text-xs text-slate-400 py-1 font-semibold">Cancel</button>
              </div>
            </SectionCard>
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

