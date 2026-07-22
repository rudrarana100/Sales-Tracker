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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard({ leads = [], followUps = [], onStartCalling, onImportClick }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

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
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Resume Calling</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      />

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={<Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
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
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all"
          >
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>View All Leads</span>
          </button>

          <button
            onClick={onStartCalling}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-blue-400" />
            <span>Start Calling</span>
          </button>

          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>
        </div>
      </SectionCard>

      {/* Grid: Today's Follow-ups & Overdue */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Follow-ups">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Nothing scheduled today</p>
                <p className="mt-0.5 text-[11px] text-slate-400">You have a clear calendar. Enjoy the quiet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-4 py-3 transition-all duration-150 hover:shadow-xs hover:border-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {lead?.lead_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400 truncate">{followUp.title}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/50">
                        {followUp.scheduled_time || "--:--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="xl:col-span-2">
          <SectionCard title="Overdue Follow-ups">
            {overdueFollowUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">You're all caught up</p>
                <p className="mt-0.5 text-[11px] text-slate-400">No overdue follow-ups. Great job!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;
                  return (
                    <div
                      key={followUp.id}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {lead?.lead_name}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 pl-4">
                        {followUp.title} &middot; Due {followUp.scheduled_date}
                      </p>
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


