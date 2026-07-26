import { useEffect, useState } from "react";
import RecentActivity from "./RecentActivity";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SectionCard from "@/components/common/SectionCard";
import {
  Phone,
  Calendar as CalendarIcon,
  Video,
  ArrowRight,
  Upload,
  Users,
  Clock,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getActivities } from "../api/activitiesApi";

// Helper function to render human-readable relative dates
function getRelativeDueDate(dateString) {
  if (!dateString) return "";
  const due = new Date(dateString);
  const today = new Date();

  // Clear time components for pure date comparison
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - due;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1) return `${diffDays} days ago`;
  return dateString;
}

function Dashboard({
  leads = [],
  followUps = [],
  onStartCalling,
  onImportClick,
}) {
  const navigate = useNavigate();
  const [todayCalls, setTodayCalls] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(20);

  const today = new Date().toISOString().split("T")[0];

  // Fetch today's call count for the mini banner
  useEffect(() => {
    async function fetchBannerData() {
      try {
        const savedGoal = localStorage.getItem("sales_daily_target");
        if (savedGoal) setDailyTarget(parseInt(savedGoal, 10));

        let callCount = 0;
        for (const lead of leads) {
          try {
            const acts = await getActivities(lead.id);
            if (acts) {
              const matches = acts.filter(
                (a) =>
                  (a.activity_type === "call_outcome" || a.activity_type === "callback" || a.activity_type === "meeting") &&
                  a.created_at?.startsWith(today)
              );
              callCount += matches.length;
            }
          } catch (e) {
            // skip error for individual lead fetch
          }
        }
        setTodayCalls(callCount);
      } catch (err) {
        console.error(err);
      }
    }

    if (leads.length > 0) {
      fetchBannerData();
    }
  }, [leads, today]);

  const targetProgress = Math.min(Math.round((todayCalls / dailyTarget) * 100), 100);

  const coldCallsRemaining = leads.filter(
    (lead) => lead.status === "cold",
  ).length;

  const followUpsToday = followUps.filter(
    (followUp) => followUp.scheduled_date === today,
  ).length;

  const meetingsToday = followUps.filter(
    (followUp) =>
      followUp.type === "meeting" && followUp.scheduled_date === today,
  ).length;

  const todayTasks = followUps
    .filter((followUp) => followUp.scheduled_date === today)
    .sort((a, b) =>
      (a.scheduled_time || "").localeCompare(b.scheduled_time || ""),
    );

  const overdueFollowUps = followUps
    .filter((followUp) => followUp.scheduled_date < today)
    .sort((a, b) =>
      (a.scheduled_time || "").localeCompare(b.scheduled_time || ""),
    );
  const overdueCount = overdueFollowUps.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Today's sales activity overview."
        action={
          <button
            onClick={onStartCalling}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-blue-200" />
            <span>Resume Calling</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      />

      {/* Daily Progress Mini-Banner */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Today's Outbound Goal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black">
                {todayCalls} / {dailyTarget} Calls
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Keep the momentum going to protect your daily streak!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="w-32 sm:w-40 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Progress</span>
              <span>{targetProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${targetProgress}%` }} />
            </div>
          </div>

          <button
            onClick={() => navigate("/analytics")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 hover:bg-blue-600 dark:hover:bg-blue-600 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Full Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          }
        />
        <StatCard
          title="Cold Calls"
          value={coldCallsRemaining}
          icon={<Phone className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Follow-ups Today"
          value={followUpsToday}
          icon={<CalendarIcon className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Meetings Today"
          value={meetingsToday}
          icon={<Video className="h-4 w-4 text-emerald-500" />}
        />
      </div>

      {/* Quick Actions Row */}
      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2.5">
          {/* Primary Action Button */}
          <button
            onClick={onStartCalling}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-blue-100" />
            <span>Start Calling</span>
          </button>

          {/* Secondary Outline Buttons */}
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>View All Leads</span>
          </button>

          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Import CSV</span>
          </button>
        </div>
      </SectionCard>

      {/* Grid: Today's Follow-ups & Overdue */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 items-stretch">
        {/* Today's Follow-ups */}
        <div className="xl:col-span-3 flex flex-col">
          <SectionCard
            title="Today's Follow-ups"
            className="flex-1 flex flex-col"
          >
            {todayTasks.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nothing scheduled today
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 max-w-[240px]">
                  You have a clear calendar. Ready to start calling?
                </p>
                <button
                  onClick={onStartCalling}
                  className="mt-4 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <Phone className="h-3 w-3 text-blue-500" />
                  <span>Start Call Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-4 py-3 transition-all duration-150 hover:shadow-xs hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {lead?.lead_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                          {followUp.title}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {followUp.scheduled_time || "--:--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Overdue Follow-ups */}
        <div className="xl:col-span-2 flex flex-col">
          <SectionCard
            title="Overdue Follow-ups"
            action={
              <button
                onClick={() => navigate("/follow-ups")}
                className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            }
            className="flex-1 flex flex-col"
          >
            {overdueFollowUps.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  You're all caught up
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  No overdue follow-ups. Great job!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;
                  const relativeDate = getRelativeDueDate(
                    followUp.scheduled_date,
                  );

                  return (
                    <div
                      key={followUp.id}
                      onClick={() => navigate("/follow-ups")}
                      className="group flex items-center justify-between cursor-pointer rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 transition-all duration-150 hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {lead?.lead_name}
                          </p>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 pl-4 truncate">
                          {followUp.title} &middot;{" "}
                          <span className="text-rose-400 font-medium">
                            {relativeDate}
                          </span>
                        </p>
                      </div>

                      {/* Redirect icon to Follow-ups Page */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/follow-ups");
                          }}
                          title="Open Follow-ups"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity">
        <RecentActivity />
      </SectionCard>
    </div>
  );
}

export default Dashboard;