import { useEffect, useState } from "react";
import {
  getFollowUps,
  completeFollowUp,
  skipFollowUp,
} from "../api/followUpsApi";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/common/SectionCard";
import { addActivity } from "../api/activitiesApi";
import PageHeader from "@/components/common/PageHeader";
import ScheduleFollowUpModal from "../components/followups/ScheduleFollowUpModal";
import {
  Globe,
  MapPin,
  MessageCircle,
  ExternalLink,
  Phone,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  cold: "bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  contacted: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  warm: "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  meeting_booked: "bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900",
  proposal_sent: "bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900",
  closed_won: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  closed_lost: "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 line-through",
};

function FollowUpsPage() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  async function fetchFollowUps() {
    try {
      const data = await getFollowUps();
      setFollowUps(data.filter((f) => f.status === "pending"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(followUp) {
    try {
      await completeFollowUp(followUp.id);
      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_completed",
        description: `Completed follow-up: ${followUp.title}`,
      });
      toast.success("Follow-up completed");
      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete follow-up.");
    }
  }

  async function handleSkip(followUp) {
    try {
      await skipFollowUp(followUp.id);
      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_skipped",
        description: `Skipped follow-up: ${followUp.title}`,
      });
      toast.success("Follow-up skipped");
      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      toast.error("Failed to skip follow-up.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Follow-ups" description="Manage your follow-up schedule." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const overdue = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });

  const todayFollowUps = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const tomorrowFollowUps = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === tomorrow.getTime();
  });

  const upcoming = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d > tomorrow;
  });

  function renderLeadCard(followUp) {
    const lead = followUp.leads;
    return (
      <div key={followUp.id} className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 cursor-pointer truncate" onClick={() => navigate(`/leads/${lead?.id}`)}>
                {lead?.lead_name}
              </h3>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusStyles[lead?.status] || "bg-slate-100 text-slate-600"}`}>
                {lead?.status?.replace(/_/g, " ") || "--"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {lead?.contact_person || "--"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {lead?.phone || "--"}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                <Clock className="h-3.5 w-3.5" />
                {followUp.scheduled_time || "--:--"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {followUp.scheduled_date}
              </span>
            </div>

            {followUp.title && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 mt-1">
                📌 {followUp.title}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* External Links */}
          <div className="flex items-center gap-1.5">
            {lead?.website && (
              <button
                onClick={() => {
                  let u = lead.website;
                  if (!u.startsWith("http")) u = "https://" + u;
                  window.open(u, "_blank");
                }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span>Website</span>
              </button>
            )}
            {lead?.google_maps_link && (
              <button
                onClick={() => window.open(lead.google_maps_link, "_blank")}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Maps</span>
              </button>
            )}
            <button
              onClick={() => {
                let p = (lead?.phone || "").replace(/\D/g, "");
                if (p.length === 10) p = "91" + p;
                window.open(`https://wa.me/${p}`, "_blank");
              }}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => navigate(`/leads/${lead?.id}`)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Open</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => handleComplete(followUp)}
              className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-xs font-bold shadow-xs transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Complete</span>
            </button>
            <button
              onClick={() => {
                setEditingFollowUp(followUp);
                setShowRescheduleModal(true);
              }}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Reschedule</span>
            </button>
            <button
              onClick={() => handleSkip(followUp)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all"
            >
              <SkipForward className="h-3.5 w-3.5 text-slate-400" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Manage and track all scheduled follow-ups."
        action={
          <button
            onClick={() => navigate("/followups/queue")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <CalendarDays className="h-4 w-4 text-purple-400" />
            <span>Start Today's Follow-ups</span>
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Overdue", count: overdue.length, icon: AlertTriangle, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" },
          { label: "Today", count: todayFollowUps.length, icon: CalendarDays, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
          { label: "Tomorrow", count: tomorrowFollowUps.length, icon: Clock, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
          { label: "Upcoming", count: upcoming.length, icon: Calendar, color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{s.count}</h2>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
          </div>
        ))}
      </div>

      {followUps.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No follow-ups scheduled</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Schedule your first follow-up from a lead's detail page.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold"><AlertTriangle className="h-4 w-4" /> Overdue ({overdue.length})</span>}>
              <div className="space-y-3">{overdue.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {todayFollowUps.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4 text-purple-500" /> Today ({todayFollowUps.length})</span>}>
              <div className="space-y-3">{todayFollowUps.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {tomorrowFollowUps.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-blue-500" /> Tomorrow ({tomorrowFollowUps.length})</span>}>
              <div className="space-y-3">{tomorrowFollowUps.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {upcoming.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-2 font-bold"><Calendar className="h-4 w-4 text-slate-400" /> Upcoming ({upcoming.length})</span>}>
              <div className="space-y-3">{upcoming.map(renderLeadCard)}</div>
            </SectionCard>
          )}
        </div>
      )}

      <ScheduleFollowUpModal
        lead={editingFollowUp?.leads}
        followUp={editingFollowUp}
        open={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setEditingFollowUp(null);
        }}
        onSaved={fetchFollowUps}
      />
    </div>
  );
}

export default FollowUpsPage;

