import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import LoadingState from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFollowUps, completeFollowUp, createFollowUp } from "../api/followUpsApi";
import { addActivity, getActivities } from "../api/activitiesApi";
import { getNotes, addNote } from "../api/notesApi";
import { updateLead } from "../api/leadsApi";
import { createGoogleMeet } from "@/utils/meetingUtils";
import ScheduleFollowUpModal from "../components/followups/ScheduleFollowUpModal";
import {
  ArrowLeft,
  Phone,
  Globe,
  MapPin,
  MessageCircle,
  User,
  Clock,
  Calendar,
  PhoneOff,
  Shield,
  CalendarCheck,
  ThumbsDown,
  ThumbsUp,
  Video,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Mail,
  FileText,
  History,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";

const statusBadge = {
  cold: {
    label: "Cold",
    class: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  },
  contacted: {
    label: "Contacted",
    class: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  },
  warm: {
    label: "Warm",
    class: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  },
  meeting_booked: {
    label: "Meeting",
    class: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
  },
  proposal_sent: {
    label: "Proposal",
    class: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
  },
  closed_won: {
    label: "Won",
    class: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  },
  closed_lost: {
    label: "Lost",
    class: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 line-through",
  },
};

export default function FollowUpQueue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackReason, setCallbackReason] = useState("");
  const [saving, setSaving] = useState(false);

  const followUp = queue[currentIndex];
  const lead = followUp?.leads;

  async function fetchQueue() {
    try {
      const data = await getFollowUps();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysQueue = (data || []).filter((item) => {
        if (item.status !== "pending") return false;
        const date = new Date(item.scheduled_date);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      });
      setQueue(todaysQueue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (lead) {
      setShowAllNotes(false);
      setShowAllActivities(false);
      getNotes(lead.id)
        .then((d) => setNotes(d || []))
        .catch(console.error);
      getActivities(lead.id)
        .then((d) => setActivities(d || []))
        .catch(console.error);
    }
  }, [lead]);

  async function finishCurrentFollowUp() {
    await completeFollowUp(followUp.id);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setQueue([]);
    }
  }

  function skipCurrentFollowUp() {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      toast.info("End of queue reached.");
    }
  }

  // Keyboard Shortcuts Listener for Follow Up Queue (Silent execution)
  useEffect(() => {
    function handleKeyDown(e) {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === "Escape") {
        setShowCallbackForm(false);
        setShowMeetingForm(false);
        setShowInterestedActions(false);
        setShowFollowUpModal(false);
        return;
      }

      if (showCallbackForm || showMeetingForm || showInterestedActions || showFollowUpModal) {
        return;
      }

      switch (e.key) {
        case "1":
          e.preventDefault();
          handleOutcome("no_answer");
          break;
        case "2":
          e.preventDefault();
          handleOutcome("gatekeeper");
          break;
        case "3":
          e.preventDefault();
          handleOutcome("callback_requested");
          break;
        case "4":
          e.preventDefault();
          handleOutcome("not_interested");
          break;
        case "5":
          e.preventDefault();
          handleOutcome("interested");
          break;
        case "s":
        case "S":
        case "ArrowRight":
          e.preventDefault();
          skipCurrentFollowUp();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    lead,
    currentIndex,
    queue,
    showCallbackForm,
    showMeetingForm,
    showInterestedActions,
    showFollowUpModal,
  ]);

  const outcomeConfig = {
    interested: { status: "warm" },
    no_answer: { status: "cold" },
    gatekeeper: { status: "contacted" },
    callback_requested: { status: "contacted" },
    not_interested: { status: "closed_lost" },
  };

  async function handleOutcome(outcome) {
    try {
      if (!lead) return;
      if (outcome === "interested") {
        setShowInterestedActions(true);
        return;
      }
      if (outcome === "callback_requested") {
        setCallbackReason("callback");
        setShowCallbackForm(true);
        return;
      }
      if (outcome === "gatekeeper") {
        setCallbackReason("gatekeeper");
        setShowCallbackForm(true);
        return;
      }
      if (outcome === "no_answer") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await createFollowUp({
          lead_id: lead.id,
          type: "call",
          title: "No Answer Follow-up",
          notes: "Retry call.",
          scheduled_date: tomorrow.toISOString().split("T")[0],
          scheduled_time: null,
          priority: "medium",
          status: "pending",
        });
      }

      await updateLead(lead.id, {
        status: outcomeConfig[outcome].status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      await addActivity({
        lead_id: lead.id,
        activity_type: "call_outcome",
        description: outcome.replaceAll("_", " "),
      });
      await finishCurrentFollowUp();
    } catch (err) {
      console.error(err);
    }
  }

  function sendWhatsapp() {
    if (!lead?.phone) {
      toast.warning("No phone number found.");
      return;
    }
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${lead.contact_person || ""},\n\nGreat speaking with you today!\n\nAs discussed, here's some information about BuiltStack.\n\nWe help businesses build modern websites that increase trust and help generate more leads.\n\nWould love to show you a few examples on a quick Google Meet whenever you're free.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }

  const saveCallbackFollowUp = async () => {
    if (!callbackDate || !callbackTime) {
      toast.warning("Please select a date and time.");
      return;
    }
    setSaving(true);
    try {
      await updateLead(lead.id, {
        follow_up_date: `${callbackDate}T${callbackTime}:00`,
      });
      await createFollowUp({
        lead_id: lead.id,
        type: "call",
        title:
          callbackReason === "gatekeeper"
            ? "Gatekeeper Follow-up"
            : "Callback Requested",
        notes: callbackNote,
        scheduled_date: callbackDate,
        scheduled_time: callbackTime,
        priority: "medium",
        status: "pending",
      });
      await addActivity({
        lead_id: lead.id,
        activity_type: "callback",
        description:
          callbackReason === "gatekeeper"
            ? `Gatekeeper Follow-up Scheduled. ${callbackNote}`
            : `Callback Requested. ${callbackNote}`,
      });
      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");
      setCallbackNote("");
      await finishCurrentFollowUp();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save follow-up.");
    } finally {
      setSaving(false);
    }
  };

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
        `Meeting with ${lead.lead_name}`,
        "BuiltStack Discovery Call",
        start.toISOString(),
        end.toISOString()
      );
      await updateLead(lead.id, {
        status: "meeting_booked",
        last_outcome: "google_meet_booked",
        last_contact_date: new Date().toISOString().split("T")[0],
        meeting_link: meetLink,
      });
      await addActivity({
        lead_id: lead.id,
        activity_type: "meeting",
        description: `Google Meet booked for ${meetingDate} at ${meetingTime}`,
      });
      sendMeetingConfirmation(meetLink);
      await finishCurrentFollowUp();
      setShowMeetingForm(false);
      setMeetingDate("");
      setMeetingTime("");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

function sendMeetingConfirmation(meetLink) {
    if (!lead?.phone) return; // (use 'lead?.phone' in FollowUpQueue)
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;

    const formattedDate = new Date(meetingDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Convert 24hr time (e.g., "14:30") to 12hr AM/PM format
    const [hours, minutes] = meetingTime.split(":");
    const parsedHours = parseInt(hours, 10);
    const adjustedHours = parsedHours % 12 || 12;
    const ampm = parsedHours >= 12 ? "PM" : "AM";
    const formattedTime = `${adjustedHours}:${minutes} ${ampm}`;

    const msg = `Hi ${lead.contact_person || lead.lead_name},\n\nOur Google Meet has been scheduled.\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nMeeting Link:\n${meetLink}\n\nLooking forward to speaking with you.\n\n- User\nBuiltStack`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }
  if (loading) {
    return <LoadingState message="Loading follow-up queue..." />;
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Follow-up Session"
          description="Focus on one follow-up at a time."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/follow-ups")}
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Exit Session
            </Button>
          }
        />
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            You're all caught up!
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            No follow-ups scheduled for today.
          </p>
        </div>
      </div>
    );
  }

  const si = statusBadge[lead?.status] || statusBadge.cold;
  const visibleNotes = showAllNotes ? notes : notes.slice(0, 2);
  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Session"
        description={`Follow-up ${currentIndex + 1} of ${queue.length}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/follow-ups")}
            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Exit Session
          </Button>
        }
      />

      {/* Main Active Lead Hero Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {lead?.lead_name}
              </h2>
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${si.class}`}
              >
                {si.label}
              </span>
            </div>
            {followUp?.title && (
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
                <span>Task: {followUp.title}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentIndex + 1} / {queue.length}
            </span>
            <button
              onClick={skipCurrentFollowUp}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <SkipForward className="h-3.5 w-3.5 text-slate-400" />
              <span>Skip</span>
            </button>
          </div>
        </div>

        {/* Structured Grid Info */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 pt-1">
          {[
            { icon: User, label: "Contact", value: lead?.contact_person },
            { icon: Phone, label: "Phone", value: lead?.phone },
            { icon: Mail, label: "Email", value: lead?.email },
            { icon: Globe, label: "Website", value: lead?.website },
            { icon: MapPin, label: "Business", value: lead?.business_type },
            {
              icon: Calendar,
              label: "Scheduled",
              value: `${followUp?.scheduled_date || ""} ${followUp?.scheduled_time || ""}`.trim(),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 p-2.5"
            >
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {item.value || "--"}
              </p>
            </div>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {[
            {
              icon: Globe,
              label: "Website",
              onClick: () => {
                if (!lead?.website) return;
                let u = lead.website;
                if (!u.startsWith("http")) u = "https://" + u;
                window.open(u, "_blank");
              },
            },
            {
              icon: MapPin,
              label: "Maps",
              onClick: () => {
                if (!lead?.google_maps_link) return;
                window.open(lead.google_maps_link, "_blank");
              },
            },
            {
              icon: Mail,
              label: "Email",
              onClick: () => {
                if (!lead?.email) {
                  toast.warning("No email found.");
                  return;
                }
                window.open(
                  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}`,
                  "_blank"
                );
              },
            },
            {
              icon: Copy,
              label: "Copy Phone",
              onClick: () => {
                if (lead?.phone) {
                  navigator.clipboard.writeText(lead.phone);
                  toast.success("Phone copied!");
                }
              },
            },
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

      {/* Main 2-Column Split Layout (FIXED: items-start eliminates vertical gaps) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* Left Column (2 cols): Context, History & Notes */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard
              title={
                <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Previous Interaction
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-4 text-xs py-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${si.class}`}
                  >
                    {si.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Last Outcome
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                    {lead?.last_outcome?.replace(/_/g, " ") || "--"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Last Contact
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {lead?.last_contact_date
                      ? new Date(lead.last_contact_date).toLocaleDateString("en-IN")
                      : "--"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Scheduled Time
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {followUp?.scheduled_time || "--:--"}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={
                <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Recent Notes
                </span>
              }
            >
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic">
                  No notes recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-2">
                    {visibleNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-2.5"
                      >
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {note.content}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(note.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {notes.length > 2 && (
                    <button
                      onClick={() => setShowAllNotes(!showAllNotes)}
                      className="w-full flex items-center justify-center gap-1 pt-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors cursor-pointer"
                    >
                      <span>
                        {showAllNotes
                          ? "Show Less"
                          : `Show More (${notes.length - 2} more)`}
                      </span>
                      {showAllNotes ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Timeline View for Activity */}
          <SectionCard
            title={
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <History className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Interaction Timeline
              </span>
            }
          >
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center italic">
                No activity history.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {visibleActivities.map((a) => (
                    <div
                      key={a.id}
                      className="relative flex items-start gap-3 text-xs"
                    >
                      <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {a.description}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(a.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {activities.length > 2 && (
                  <button
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="w-full flex items-center justify-center gap-1 pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors border-t border-slate-100 dark:border-slate-800/80 cursor-pointer"
                  >
                    <span>
                      {showAllActivities
                        ? "Show Less"
                        : `Show More (${activities.length - 2} more)`}
                    </span>
                    {showAllActivities ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column (1 col): Call Outcome Controls with PC Hover Badges */}
        <div className="lg:sticky lg:top-6">
          <SectionCard
            title={
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Log Call Outcome
              </span>
            }
          >
            <div className="space-y-2 pt-1">
              {[
                { icon: PhoneOff, label: "No Answer", action: "no_answer", key: "1" },
                { icon: Shield, label: "Gatekeeper", action: "gatekeeper", key: "2" },
                {
                  icon: CalendarCheck,
                  label: "Callback Requested",
                  action: "callback_requested",
                  key: "3",
                },
                {
                  icon: ThumbsDown,
                  label: "Not Interested",
                  action: "not_interested",
                  key: "4",
                },
                {
                  icon: ThumbsUp,
                  label: "Interested",
                  action: "interested",
                  primary: true,
                  key: "5",
                },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleOutcome(btn.action)}
                  className={`group w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                    btn.primary
                      ? "bg-emerald-600 hover:bg-emerald-500 border-transparent text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200"
                  }`}
                  title={`Press '${btn.key}' to log ${btn.label}`}
                >
                  <span className="flex items-center gap-2.5">
                    <btn.icon
                      className={`h-4 w-4 ${btn.primary ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                    />
                    <span>{btn.label}</span>
                  </span>

                  {/* Shortcut key hidden by default, reveals only on desktop hover */}
                  <span
                    className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md border ${
                      btn.primary
                        ? "bg-emerald-700/60 border-emerald-400/40 text-white"
                        : "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {btn.key}
                  </span>
                </button>
              ))}

              <button
                onClick={skipCurrentFollowUp}
                className="group w-full flex items-center justify-between rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all mt-3 cursor-pointer"
                title="Press 'S' or 'Right Arrow' to skip item"
              >
                <span className="flex items-center gap-2">
                  <SkipForward className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  <span>Skip to Next Item</span>
                </span>

                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  S
                </span>
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
                <span>
                  {callbackReason === "gatekeeper"
                    ? "Gatekeeper Follow-up"
                    : "Schedule Callback"}
                </span>
              </h3>
              <button
                onClick={() => setShowCallbackForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Time
                </label>
                <input
                  type="time"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Notes
                </label>
                <input
                  placeholder="Add context or notes..."
                  value={callbackNote}
                  onChange={(e) => setCallbackNote(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCallbackForm(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveCallbackFollowUp}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
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
              <button
                onClick={() => setShowMeetingForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Time
                </label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowMeetingForm(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveMeeting}
                disabled={saving}
                className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-2 text-xs font-bold transition-all shadow-md shadow-purple-500/20 cursor-pointer"
              >
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
              <button
                onClick={() => setShowInterestedActions(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  sendWhatsapp();
                  setShowInterestedActions(false);
                  setShowFollowUpModal(true);
                }}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setShowInterestedActions(false);
                  setShowMeetingForm(true);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Book Google Meet</span>
              </button>

              <button
                onClick={() => {
                  setShowInterestedActions(false);
                  setShowFollowUpModal(true);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Schedule Follow-up</span>
              </button>
            </div>

            <button
              onClick={() => setShowInterestedActions(false)}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ScheduleFollowUpModal
        open={showFollowUpModal}
        lead={lead}
        onClose={() => setShowFollowUpModal(false)}
        onSaved={async () => {
          await updateLead(lead.id, {
            status: "warm",
            last_outcome: "interested",
            last_contact_date: new Date().toISOString().split("T")[0],
          });
          await addActivity({
            lead_id: lead.id,
            activity_type: "status_change",
            description: "Lead marked as Interested",
          });
          await finishCurrentFollowUp();
        }}
      />
    </div>
  );
}