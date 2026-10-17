import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { getLeads, updateLead, getImportBatches } from "../api/leadsApi";
import { getActivities, addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import { getNotes, addNote } from "../api/notesApi";
import { createFollowUp } from "../api/followUpsApi";
import LoadingState from "@/components/common/LoadingState";
import {
  Phone,
  User,
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
  History,
  ExternalLink,
  Send,
  Briefcase,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Lazy-loaded modals for code splitting
const ScheduleFollowUpModal = lazy(() => import("../components/followups/ScheduleFollowUpModal"));
const WhatsAppModal = lazy(() => import("@/components/whatsapp/whatsappModal"));

const today = () => new Date().toISOString().split("T")[0];

function normalizeUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
}

function prettyUrl(url) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}

function cleanPhone(raw) {
  if (!raw) return "";
  let p = raw.replace(/\D/g, "");
  if (p.startsWith("0")) p = p.slice(1);
  if (p.length === 10) p = "91" + p;
  return p;
}

const outcomeConfig = {
  interested: { status: "warm" },
  no_answer: { status: "cold" },
  invalid_number: { status: "closed_lost" },
  gatekeeper: { status: "cold" },
  not_interested: { status: "closed_lost" },
};

export default function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [loading, setLoading] = useState(true);

  // Workspace States
  const [activeTab, setActiveTab] = useState("maps");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [skippedLeadIds, setSkippedLeadIds] = useState([]);

  // Modal & Form States
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackReason, setCallbackReason] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [saving, setSaving] = useState(false);

  // Blocks double-logging when a key is pressed twice before the screen re-renders
  const lastHandledRef = useRef(null);

  // ---------------- Queue logic (memoized) ----------------
  const coldLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status === "cold" &&
          !skippedLeadIds.includes(l.id) &&
          (selectedCollection === "all" || l.import_batch === selectedCollection)
      ),
    [leads, skippedLeadIds, selectedCollection]
  );

  const totalColdForSelectedCollection = useMemo(
    () =>
      leads.filter(
        (l) => l.status === "cold" && (selectedCollection === "all" || l.import_batch === selectedCollection)
      ).length,
    [leads, selectedCollection]
  );

  const currentLead = coldLeads[0];
  const currentIndex = totalColdForSelectedCollection - coldLeads.length + 1;

  // ---------------- Data loading ----------------
  // Leads + collections are loaded ONCE, in parallel. After that the UI updates
  // locally, so logging an outcome no longer re-downloads every lead.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, batchList] = await Promise.all([getLeads(), getImportBatches().catch(() => [])]);
        if (cancelled) return;
        setLeads(data || []);
        setCollections(batchList ? batchList.filter(Boolean) : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load leads.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keyed on the lead ID (not the object), so notes/tab/typed text don't reset
  // every time the leads array changes.
  const currentLeadId = currentLead?.id;
  useEffect(() => {
    if (!currentLeadId) return;
    let cancelled = false;
    lastHandledRef.current = null;
    setActiveTab("maps");
    setNewNote("");
    setNotes([]);
    setActivities([]);
    Promise.all([getNotes(currentLeadId).catch(() => []), getActivities(currentLeadId).catch(() => [])]).then(
      ([notesData, activitiesData]) => {
        if (cancelled) return;
        setNotes(notesData || []);
        setActivities(activitiesData || []);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [currentLeadId]);

  // ---------------- Queue helpers ----------------
  function patchLocal(lead, patch) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));
    setSkippedLeadIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
  }

  function rollback(lead) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    setSkippedLeadIds((prev) => prev.filter((id) => id !== lead.id));
    lastHandledRef.current = null;
  }

  // ---------------- Actions ----------------
  async function skipLead() {
    const lead = currentLead;
    if (!lead || lastHandledRef.current === lead.id) return;
    lastHandledRef.current = lead.id;

    patchLocal(lead, { last_outcome: "skipped" });
    try {
      await Promise.all([
        updateLead(lead.id, { last_outcome: "skipped" }),
        addActivity({
          lead_id: lead.id,
          activity_type: "call_outcome",
          description: "Lead skipped during call session",
        }),
      ]);
    } catch {
      toast.error("Failed to save skip.");
      rollback(lead);
    }
  }

  async function handleOutcome(outcome) {
    const lead = currentLead;
    if (!lead || lastHandledRef.current === lead.id) return;

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
    if (outcome === "interested") {
      setShowInterestedActions(true);
      return;
    }

    lastHandledRef.current = lead.id;
    const patch = {
      status: outcomeConfig[outcome].status,
      last_outcome: outcome,
      last_contact_date: today(),
    };

    // Independent requests run in parallel instead of one after another
    const tasks = [
      updateLead(lead.id, patch),
      addActivity({
        lead_id: lead.id,
        activity_type: "call_outcome",
        description: outcome.replace(/_/g, " "),
      }),
    ];
    if (outcome === "no_answer") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tasks.push(
        createFollowUp({
          lead_id: lead.id,
          type: "call",
          title: "No Answer Follow-up",
          notes: "Retry call.",
          scheduled_date: tomorrow.toISOString().split("T")[0],
          priority: "medium",
          status: "pending",
        })
      );
    }

    // Instant UI: move to the next lead now, save in the background
    patchLocal(lead, patch);
    toast.success(`Logged: ${outcome.replace(/_/g, " ")}`);

    try {
      await Promise.all(tasks);
    } catch {
      toast.error(`Could not save outcome for ${lead.lead_name}. Restored it to the queue.`);
      rollback(lead);
    }
  }

  async function handleAddLiveNote() {
    if (!newNote.trim() || !currentLead) return;
    try {
      await addNote({ lead_id: currentLead.id, content: newNote.trim() });
      toast.success("Note saved");
      setNewNote("");
      const updatedNotes = await getNotes(currentLead.id);
      setNotes(updatedNotes || []);
    } catch {
      toast.error("Failed to save note");
    }
  }

  function callNow() {
    if (!currentLead?.phone) return toast.warning("No phone number found.");
    window.location.href = `tel:+${cleanPhone(currentLead.phone)}`;
  }

  // ---------------- Keyboard shortcuts ----------------
  useEffect(() => {
    function handleKeyDown(e) {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      if (e.key === "Escape") {
        setShowCallbackForm(false);
        setShowMeetingForm(false);
        setShowInterestedActions(false);
        setShowFollowUpModal(false);
        setShowWhatsAppModal(false);
        return;
      }
      if (showCallbackForm || showMeetingForm || showInterestedActions || showFollowUpModal || showWhatsAppModal) return;

      switch (e.key) {
        case "1": e.preventDefault(); handleOutcome("no_answer"); break;
        case "2": e.preventDefault(); handleOutcome("invalid_number"); break;
        case "3": e.preventDefault(); handleOutcome("gatekeeper"); break;
        case "4": e.preventDefault(); handleOutcome("callback_requested"); break;
        case "5": e.preventDefault(); handleOutcome("not_interested"); break;
        case "6": e.preventDefault(); handleOutcome("interested"); break;
        case "s": case "S": case "ArrowRight": e.preventDefault(); skipLead(); break;
        default: break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLead, showCallbackForm, showMeetingForm, showInterestedActions, showFollowUpModal, showWhatsAppModal]);

  // ---------------- Modal savers ----------------
  async function saveCallback() {
    if (!callbackDate || !callbackTime) return toast.warning("Please select date and time.");
    const lead = currentLead;
    setSaving(true);
    try {
      const patch = { status: "contacted", last_outcome: "callback_requested", last_contact_date: today() };
      await Promise.all([
        updateLead(lead.id, patch),
        createFollowUp({
          lead_id: lead.id,
          type: "call",
          title: callbackReason === "gatekeeper" ? "Gatekeeper Follow-up" : "Callback",
          notes: callbackNote,
          scheduled_date: callbackDate,
          scheduled_time: callbackTime,
          priority: "medium",
          status: "pending",
        }),
        callbackNote.trim() ? addNote({ lead_id: lead.id, content: callbackNote.trim() }) : Promise.resolve(),
      ]);

      toast.success("Callback scheduled");
      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");
      setCallbackNote("");
      setCallbackReason("");
      patchLocal(lead, patch);
    } catch {
      toast.error("Error saving callback");
    } finally {
      setSaving(false);
    }
  }

  async function saveMeeting() {
    if (!meetingDate || !meetingTime) return toast.warning("Please select date and time.");
    const lead = currentLead;
    setSaving(true);
    try {
      // Open the tab synchronously (before any await) so the browser doesn't block it as a popup
      const whatsappWindow = lead?.phone ? window.open("", "_blank") : null;
      const start = new Date(`${meetingDate}T${meetingTime}`);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const meetLink = await createGoogleMeet(
        `Meeting with ${lead.lead_name}`,
        "Discovery Call",
        start.toISOString(),
        end.toISOString()
      );

      const patch = {
        status: "meeting_booked",
        last_outcome: "google_meet_booked",
        last_contact_date: today(),
        meeting_link: meetLink,
      };
      await updateLead(lead.id, patch);

      const phone = cleanPhone(lead?.phone);
      if (phone) {
        const message = `Hi ${lead.contact_person || lead.lead_name}, your Google Meet is confirmed for ${meetingDate} at ${meetingTime}. Link: ${meetLink}`;
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        if (whatsappWindow) {
          whatsappWindow.location.href = waUrl;
          setTimeout(() => whatsappWindow.close(), 4000);
        } else {
          window.open(waUrl, "_blank");
        }
        toast.success("Meeting booked & WhatsApp dispatched!");
      } else {
        whatsappWindow?.close();
        toast.success("Meeting booked!");
      }

      setShowMeetingForm(false);
      patchLocal(lead, patch);
    } catch {
      toast.error("Failed to book meeting.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading dialer workspace..." />;

  // ---------------- Empty state ----------------
  if (!currentLead) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <PhoneCall className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Session Complete</h2>
          <p className="mt-2 text-sm text-slate-500">No cold leads remaining in this collection.</p>
        </div>
        <select
          value={selectedCollection}
          onChange={(e) => { setSelectedCollection(e.target.value); setSkippedLeadIds([]); }}
          className="mt-4 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-bold shadow-sm outline-none"
        >
          <option value="all">📁 Switch to All Collections</option>
          {collections.map((col) => <option key={col} value={col}>📂 {col}</option>)}
        </select>
      </div>
    );
  }

  const rating = currentLead.rating != null ? Number(currentLead.rating) : null;
  const reviewsCount = currentLead.reviews_count != null ? Number(currentLead.reviews_count) : null;
  const hasWebsite = !!currentLead.website;
  const mapsQuery = [currentLead.lead_name, currentLead.address].filter(Boolean).join(", ");

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4 overflow-hidden">

      {/* ================= LEFT PANEL: ACTION CENTER ================= */}
      <div className="w-full md:w-[32%] flex flex-col gap-4 overflow-y-auto pr-1 pb-4">

        {/* Header / Queue Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Queue Progress</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {currentIndex} <span className="text-slate-400 font-medium text-xs">of</span> {totalColdForSelectedCollection}
            </p>
          </div>
          <select
            value={selectedCollection}
            onChange={(e) => { setSelectedCollection(e.target.value); setSkippedLeadIds([]); }}
            className="max-w-[140px] h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Lists</option>
            {collections.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Primary Action Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-4 shrink-0">
          <div>
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
              {currentLead.status}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {currentLead.lead_name}
            </h1>

            {/* Quick glance: rating + website status */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {rating != null && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {rating.toFixed(1)}
                  {reviewsCount != null && (
                    <span className="font-medium text-amber-600/80 dark:text-amber-500/80">
                      ({reviewsCount.toLocaleString("en-IN")})
                    </span>
                  )}
                </span>
              )}
              {hasWebsite ? (
                <a
                  href={normalizeUrl(currentLead.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 max-w-full"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{prettyUrl(currentLead.website)}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Globe className="h-3.5 w-3.5" /> No website, pitch opportunity
                </span>
              )}
            </div>
          </div>

          <button
            onClick={callNow}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <PhoneCall className="h-5 w-5" /> CALL NOW
          </button>
        </div>

        {/* Log Outcome Grid */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col gap-3 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Outcome & Auto-Advance</p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Interested", action: "interested", icon: ThumbsUp, color: "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300", key: "6" },
              { label: "Callback", action: "callback_requested", icon: CalendarCheck, color: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300", key: "4" },
              { label: "No Answer", action: "no_answer", icon: PhoneOff, color: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300", key: "1" },
              { label: "Gatekeeper", action: "gatekeeper", icon: Shield, color: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300", key: "3" },
              { label: "Invalid Num", action: "invalid_number", icon: Ban, color: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300", key: "2" },
              { label: "Not Int.", action: "not_interested", icon: ThumbsDown, color: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300", key: "5" },
            ].map((btn) => (
              <button
                key={btn.action}
                onClick={() => handleOutcome(btn.action)}
                title={`Press '${btn.key}'`}
                className={`group relative flex items-center justify-center gap-2 px-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${btn.color}`}
              >
                <btn.icon className="h-4 w-4" />
                {btn.label}
                <span className="absolute top-1 right-1.5 opacity-0 group-hover:opacity-50 text-[9px] font-mono">{btn.key}</span>
              </button>
            ))}
          </div>

          <button
            onClick={skipLead}
            className="mt-1 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            title="Press 'S'"
          >
            <SkipForward className="h-3.5 w-3.5" /> Skip Lead (S)
          </button>
        </div>
      </div>

      {/* ================= RIGHT PANEL: CONTEXT & WORKSPACE ================= */}
      <div className="w-full md:w-[68%] flex flex-col gap-4 overflow-hidden">

        {/* Top: Comprehensive Lead Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm p-5 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><User className="h-3.5 w-3.5" /> Contact Person</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLead.contact_person || "--"}</p>
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLead.phone || "--"}</p>
                {currentLead.phone && (
                  <button onClick={() => { navigator.clipboard.writeText(currentLead.phone); toast.success("Copied!"); }} className="text-slate-400 hover:text-slate-600">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Globe className="h-3.5 w-3.5" /> Website</span>
              {hasWebsite ? (
                <div className="flex items-center gap-2 min-w-0">
                  <a
                    href={normalizeUrl(currentLead.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:underline truncate"
                    title={currentLead.website}
                  >
                    {prettyUrl(currentLead.website)}
                  </a>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </div>
              ) : (
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">None, needs a website</p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Star className="h-3.5 w-3.5" /> Rating & Reviews</span>
              {rating != null ? (
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {rating.toFixed(1)} <span className="text-amber-500">★</span>
                  {reviewsCount != null && (
                    <span className="text-slate-500 font-medium"> · {reviewsCount.toLocaleString("en-IN")} reviews</span>
                  )}
                </p>
              ) : (
                <p className="text-sm font-bold text-slate-500">--</p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Briefcase className="h-3.5 w-3.5" /> Business Type</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{currentLead.business_type || "--"}</p>
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><History className="h-3.5 w-3.5" /> Last Outcome</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{currentLead.last_outcome?.replace(/_/g, " ") || "--"}</p>
            </div>

            <div className="space-y-1.5 col-span-2 md:col-span-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><MapPin className="h-3.5 w-3.5" /> Address</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLead.address || "--"}</p>
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Calendar className="h-3.5 w-3.5" /> Next Follow-up</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLead.follow_up_date || "--"}</p>
            </div>
          </div>
        </div>

        {/* Bottom: Workspace Tabs */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 p-2 gap-2 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
            <button
              onClick={() => setActiveTab("maps")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "maps" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <MapPin className="h-3.5 w-3.5" /> Map Location
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "history" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <History className="h-3.5 w-3.5" /> Timeline & Notes
            </button>

            {currentLead.google_maps_link && (
              <a
                href={currentLead.google_maps_link}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
              </a>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/20 p-4">

            {/* Maps view: name + address so chains/duplicates resolve to the right branch */}
            {activeTab === "maps" && (
              <div className="w-full h-full min-h-[300px] max-h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <iframe
                  key={currentLead.id}
                  title="Google Maps"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                  allowFullScreen
                />
              </div>
            )}

            {/* Notes & Timeline View */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Call Notes</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type notes here while on the phone..."
                    className="w-full h-20 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-violet-500 outline-none resize-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={handleAddLiveNote}
                    className="self-end flex items-center gap-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-400 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    <Send className="h-3.5 w-3.5" /> Save Note
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> History
                  </h3>
                  {activities.length === 0 && notes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No previous interactions recorded.</p>
                  ) : (
                    <div className="relative pl-4 space-y-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {notes.map((n) => (
                        <div key={`note-${n.id}`} className="relative flex items-start gap-3">
                          <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-amber-500" />
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-3 rounded-xl w-full">
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.content}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70 mt-1.5">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {activities.map((a) => (
                        <div key={`act-${a.id}`} className="relative flex items-start gap-3">
                          <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-violet-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{a.description}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {showCallbackForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-amber-500" />
                <span>{callbackReason === "gatekeeper" ? "Gatekeeper Follow-up" : "Schedule Callback"}</span>
              </h3>
              <button onClick={() => setShowCallbackForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Date</label>
                <input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Time</label>
                <input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Notes</label>
                <input placeholder="Add context..." value={callbackNote} onChange={(e) => setCallbackNote(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowCallbackForm(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 text-xs font-bold transition-all">Cancel</button>
              <button onClick={saveCallback} disabled={saving} className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-xs font-bold transition-all shadow-md">{saving ? "Saving..." : "Save Callback"}</button>
            </div>
          </div>
        </div>
      )}

      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" /> <span>Book Google Meet</span>
              </h3>
              <button onClick={() => setShowMeetingForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Date</label>
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Time</label>
                <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowMeetingForm(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 text-xs font-bold transition-all">Cancel</button>
              <button onClick={saveMeeting} disabled={saving} className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-2 text-xs font-bold transition-all shadow-md">{saving ? "Creating..." : "Confirm Meeting"}</button>
            </div>
          </div>
        </div>
      )}

      {showInterestedActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-600" /> <span>Prospect Interested</span>
              </h3>
              <button onClick={() => setShowInterestedActions(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2.5">
              <button onClick={() => { setShowInterestedActions(false); setShowWhatsAppModal(true); }} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <MessageCircle className="h-4 w-4" /> <span>Send WhatsApp</span>
              </button>
              <button onClick={() => { setShowInterestedActions(false); setShowMeetingForm(true); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <Video className="h-4 w-4 text-purple-600" /> <span>Book Google Meet</span>
              </button>
              <button onClick={() => { setShowInterestedActions(false); setShowFollowUpModal(true); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <Calendar className="h-4 w-4 text-violet-600" /> <span>Schedule Follow-up</span>
              </button>
            </div>
            <button onClick={() => setShowInterestedActions(false)} className="w-full text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white py-1 font-bold transition-all">Cancel</button>
          </div>
        </div>
      )}

      {showWhatsAppModal && (
        <Suspense fallback={null}>
          <WhatsAppModal open={showWhatsAppModal} lead={currentLead} onClose={() => setShowWhatsAppModal(false)} extraParams={{ date: meetingDate, time: meetingTime, link: currentLead?.meeting_link || "" }} />
        </Suspense>
      )}

      {showFollowUpModal && (
        <Suspense fallback={null}>
          <ScheduleFollowUpModal
            open={showFollowUpModal}
            lead={currentLead}
            onClose={() => setShowFollowUpModal(false)}
            onSaved={async () => {
              const lead = currentLead;
              const patch = { status: "warm", last_outcome: "interested", last_contact_date: today() };
              patchLocal(lead, patch);
              try {
                await Promise.all([
                  updateLead(lead.id, patch),
                  addActivity({ lead_id: lead.id, activity_type: "status_change", description: "Lead marked as Interested" }),
                ]);
              } catch {
                toast.error("Could not mark lead as interested.");
                rollback(lead);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
