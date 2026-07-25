import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";
import { getActivities, addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import LoadingState from "@/components/common/LoadingState";
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
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  History,
} from "lucide-react";
import { toast } from "sonner";

const statusBadge = {
  cold: { label: "Cold", class: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" },
  contacted: { label: "Contacted", class: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800" },
  warm: { label: "Warm", class: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" },
  meeting_booked: { label: "Meeting", class: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800" },
  proposal_sent: { label: "Proposal", class: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800" },
  closed_won: { label: "Won", class: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" },
  closed_lost: { label: "Lost", class: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 line-through" },
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

  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const coldLeads = leads.filter(
    (l) => l.status === "cold" && !skippedLeadIds.includes(l.id)
  );
  const currentLead = coldLeads[0];
  const totalCold = leads.filter((l) => l.status === "cold").length;
  const currentIndex = totalCold - coldLeads.length + 1;

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data || []);
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
      setShowAllNotes(false);
      setShowAllActivities(false);
      getNotes(currentLead.id)
        .then((d) => setNotes(d || []))
        .catch(console.error);
      getActivities(currentLead.id)
        .then((d) => setActivities(d || []))
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
    if (!currentLead?.phone) {
      toast.warning("No phone number found.");
      return;
    }
    let phone = currentLead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${currentLead.contact_person || ""},\nGreat speaking with you today!`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
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
        end.toISOString()
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
    if (!currentLead?.phone) return;
    let phone = currentLead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${currentLead.contact_person || currentLead.lead_name},\n\nOur Google Meet has been scheduled.\n📅 Date: ${meetingDate}\n🕒 Time: ${meetingTime}\nLink: ${meetLink}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (loading) {
    return <LoadingState message="Preparing call session workspace..." />;
  }

  if (coldLeads.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Session" description="All caught up for today." />
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <PhoneCall className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Session Complete</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">No cold leads remaining to call.</p>
        </div>
      </div>
    );
  }

  const si = statusBadge[currentLead.status] || statusBadge.cold;

  const visibleNotes = showAllNotes ? notes : notes.slice(0, 2);
  const visibleActivities = showAllActivities ? activities : activities.slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Session"
        description={`Lead ${currentIndex} of ${totalCold}`}
      />

      {/* Main Active Lead Hero Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentLead.lead_name}
              </h2>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${si.class}`}>
                {si.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Last Contacted: <span className="text-slate-800 dark:text-slate-200 font-medium">{currentLead.last_contact_date ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentIndex} / {totalCold}
            </span>
            <button
              onClick={skipLead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <SkipForward className="h-3.5 w-3.5 text-slate-400" />
              <span>Skip</span>
            </button>
          </div>
        </div>

        {/* Structured Grid Info (Light & Dark mode fixed) */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 pt-1">
          {[
            { icon: User, label: "Contact", value: currentLead.contact_person },
            { icon: Phone, label: "Phone", value: currentLead.phone },
            { icon: Mail, label: "Email", value: currentLead.email },
            { icon: Globe, label: "Website", value: currentLead.website },
            { icon: MapPin, label: "Business", value: currentLead.business_type },
            { icon: Calendar, label: "Follow-up", value: currentLead.follow_up_date ? `${currentLead.follow_up_date}` : "--" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.value || "--"}</p>
            </div>
          ))}
        </div>

        {/* Action Toolbar (Light & Dark mode fixed) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
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
              if (!currentLead.phone) return;
              navigator.clipboard.writeText(currentLead.phone);
              toast.success("Phone copied!");
            }},
            { icon: MessageCircle, label: "WhatsApp", onClick: sendWhatsapp },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <btn.icon className="h-3.5 w-3.5 text-slate-400" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {/* Left Column (2 cols): Context, History & Notes */}
        <div className="space-y-6 lg:col-span-2 flex flex-col justify-between">
          
          {/* Side-by-side equal height sub-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col">
              <SectionCard 
                title={<span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider"><Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Previous Interaction</span>}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="grid grid-cols-2 gap-4 text-xs py-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${si.class}`}>{si.label}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Last Outcome</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">{currentLead.last_outcome?.replace(/_/g, " ") || "--"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Last Contact</p>
                    <p className="text-slate-700 dark:text-slate-300">{currentLead.last_contact_date ? new Date(currentLead.last_contact_date).toLocaleDateString("en-IN") : "--"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Next Follow-up</p>
                    <p className="text-slate-700 dark:text-slate-300">{currentLead.follow_up_date || "--"}</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="flex flex-col">
              <SectionCard 
                title={<span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider"><FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Recent Notes</span>}
                className="flex-1 flex flex-col justify-between"
              >
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic">No notes recorded yet.</p>
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {visibleNotes.map((note) => (
                        <div key={note.id} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-2.5">
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{note.content}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{new Date(note.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                      ))}
                    </div>

                    {notes.length > 2 && (
                      <button
                        onClick={() => setShowAllNotes(!showAllNotes)}
                        className="w-full flex items-center justify-center gap-1 pt-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors cursor-pointer"
                      >
                        <span>{showAllNotes ? "Show Less" : `Show More (${notes.length - 2} more)`}</span>
                        {showAllNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>

          {/* Timeline View for Activity */}
          <SectionCard title={<span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider"><History className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Interaction Timeline</span>}>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center italic">No activity history.</p>
            ) : (
              <div className="space-y-3">
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {visibleActivities.map((a) => (
                    <div key={a.id} className="relative flex items-start gap-3 text-xs">
                      <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{a.description}</p>
                        <p className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activities.length > 2 && (
                  <button
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="w-full flex items-center justify-center gap-1 pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors border-t border-slate-100 dark:border-slate-800/80 cursor-pointer"
                  >
                    <span>{showAllActivities ? "Show Less" : `Show More (${activities.length - 2} more)`}</span>
                    {showAllActivities ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column (1 col): Call Outcome Controls (Light & Dark mode fixed) */}
        <div className="lg:sticky lg:top-6 flex flex-col h-full">
          <SectionCard 
            title={<span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider"><Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Log Call Outcome</span>}
            className="h-full flex flex-col justify-between"
          >
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
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                    btn.primary
                      ? "bg-emerald-600 hover:bg-emerald-500 border-transparent text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <btn.icon className={`h-4 w-4 ${btn.primary ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                    <span>{btn.label}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}

              <button
                onClick={skipLead}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all mt-3 cursor-pointer"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip to Next Lead
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* POPUP MODALS */}
      {/* Schedule Callback Modal */}
      {showCallbackForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span>{callbackReason === "gatekeeper" ? "Gatekeeper Follow-up" : "Schedule Callback"}</span>
              </h3>
              <button onClick={() => setShowCallbackForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Date</label>
                <input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Time</label>
                <input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Notes</label>
                <input placeholder="Add context or notes..." value={callbackNote} onChange={(e) => setCallbackNote(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowCallbackForm(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-semibold transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={saveCallback} disabled={saving} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer">
                {saving ? "Saving..." : "Save Callback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Google Meet Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Book Google Meet</span>
              </h3>
              <button onClick={() => setShowMeetingForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Date</label>
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">Time</label>
                <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowMeetingForm(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-semibold transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={saveMeeting} disabled={saving} className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-2 text-xs font-bold transition-all shadow-md shadow-purple-500/20 cursor-pointer">
                {saving ? "Creating..." : "Confirm Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prospect Interested Actions Modal */}
      {showInterestedActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Prospect Interested</span>
              </h3>
              <button onClick={() => setShowInterestedActions(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button onClick={() => { sendWhatsapp(); markInterested(); }} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp</span>
              </button>

              <button onClick={() => { setShowInterestedActions(false); setShowMeetingForm(true); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Book Google Meet</span>
              </button>

              <button onClick={markInterested} className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Schedule Follow-up</span>
              </button>
            </div>

            <button onClick={() => setShowInterestedActions(false)} className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 font-semibold transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

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