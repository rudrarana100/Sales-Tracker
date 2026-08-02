import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import { getActivities } from "../api/activitiesApi";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import LoadingState from "@/components/common/LoadingState";
import {
  TrendingUp,
  Users,
  Calendar,
  Award,
  PieChart,
  CheckCircle2,
  Flame,
  PhoneCall,
  Zap,
  Target,
  Sparkles,
  X,
  Settings2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Trophy,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Daily Target State (Saved locally)
  const [dailyTarget, setDailyTarget] = useState(() => {
    const saved = localStorage.getItem("sales_daily_target");
    return saved ? parseInt(saved, 10) : 20;
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(dailyTarget);
  const [showCelebration, setShowCelebration] = useState(false);

  async function fetchAllData() {
    try {
      const leadsData = await getLeads();
      setLeads(leadsData || []);

      if (leadsData && leadsData.length > 0) {
        const activityPromises = leadsData.map((lead) =>
          getActivities(lead.id).catch(() => [])
        );
        const results = await Promise.all(activityPromises);
        const flattenedActivities = results.flat().filter(Boolean);
        setActivities(flattenedActivities);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalLeads = leads.length;
  const coldLeads = leads.filter((l) => l.status === "cold").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const warmLeads = leads.filter((l) => l.status === "warm").length;
  const meetingsBooked = leads.filter((l) => l.status === "meeting_booked").length;
  const proposalsSent = leads.filter((l) => l.status === "proposal_sent").length;
  const closedWon = leads.filter((l) => l.status === "closed_won").length;
  const closedLost = leads.filter((l) => l.status === "closed_lost").length;

  const conversionRate =
    totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : 0;

  const callActivities = activities.filter(
    (a) =>
      a.activity_type === "call_outcome" ||
      a.activity_type === "callback" ||
      a.activity_type === "meeting"
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCalls = callActivities.filter((a) =>
    a.created_at?.startsWith(todayStr)
  ).length;

  // Yesterday calls for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdayCalls = callActivities.filter((a) =>
    a.created_at?.startsWith(yesterdayStr)
  ).length;

  const callDiff = todayCalls - yesterdayCalls;
  const targetProgress = Math.min(
    Math.round((todayCalls / dailyTarget) * 100),
    100
  );

  const activityMap = {};
  const dailyCallCounts = {};
  
  callActivities.forEach((a) => {
    if (a.created_at) {
      const dt = a.created_at.split("T")[0];
      activityMap[dt] = (activityMap[dt] || 0) + 1;
      dailyCallCounts[dt] = (dailyCallCounts[dt] || 0) + 1;
    }
  });

  // Calculate Personal Best (Max calls in a single day)
  const personalBestCalls = Object.values(dailyCallCounts).length > 0 
    ? Math.max(...Object.values(dailyCallCounts), todayCalls) 
    : todayCalls;

  // Calculate Streak
  let currentStreak = 0;
  let checkDate = new Date();
  while (true) {
    const dStr = checkDate.toISOString().split("T")[0];
    if (activityMap[dStr] && activityMap[dStr] > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (currentStreak === 0 && dStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Peak Calling Hours Calculation
  const hourCounts = { "Morning (9am-12pm)": 0, "Afternoon (12pm-4pm)": 0, "Evening (4pm-8pm)": 0 };
  callActivities.forEach((a) => {
    if (a.created_at) {
      const hour = new Date(a.created_at).getHours();
      if (hour >= 9 && hour < 12) hourCounts["Morning (9am-12pm)"]++;
      else if (hour >= 12 && hour < 16) hourCounts["Afternoon (12pm-4pm)"]++;
      else if (hour >= 16 && hour <= 20) hourCounts["Evening (4pm-8pm)"]++;
    }
  });

  useEffect(() => {
    if (todayCalls >= dailyTarget && dailyTarget > 0) {
      const celebratedToday = localStorage.getItem(`celebrated_${todayStr}`);
      if (!celebratedToday) {
        setShowCelebration(true);
        localStorage.setItem(`celebrated_${todayStr}`, "true");
      }
    }
  }, [todayCalls, dailyTarget, todayStr]);

  function saveNewGoal(e) {
    e.preventDefault();
    const val = parseInt(newTargetInput, 10);
    if (val > 0) {
      setDailyTarget(val);
      localStorage.setItem("sales_daily_target", val.toString());
      setShowGoalModal(false);
    }
  }

  const outcomeCounts = {
    Interested: callActivities.filter((a) =>
      a.description?.toLowerCase().includes("interested")
    ).length,
    "No Answer": callActivities.filter((a) =>
      a.description?.toLowerCase().includes("no answer")
    ).length,
    Gatekeeper: callActivities.filter((a) =>
      a.description?.toLowerCase().includes("gatekeeper")
    ).length,
    "Callback Requested": callActivities.filter((a) =>
      a.description?.toLowerCase().includes("callback")
    ).length,
    "Not Interested": callActivities.filter((a) =>
      a.description?.toLowerCase().includes("not interested")
    ).length,
  };

  const gridDays = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const count = activityMap[dStr] || 0;
    gridDays.push({ date: dStr, count });
  }

  function getHeatColor(count) {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/60";
    if (count === 1) return "bg-emerald-300 dark:bg-emerald-900";
    if (count <= 3) return "bg-emerald-500 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500 shadow-xs shadow-emerald-500/50";
  }

  function getPercentage(count) {
    if (totalLeads === 0) return 0;
    return Math.round((count / totalLeads) * 100);
  }

  if (loading) {
    return <LoadingState message="Generating advanced metrics and heatmap..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Sales Analytics & Performance Dashboard"
        description="Monitor daily dialing quotas, peak calling hours, personal records, and conversion funnels."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Daily Call Goal
                </h4>
                <p className="text-[11px] text-slate-400">
                  Target: {dailyTarget} calls today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {todayCalls} / {dailyTarget}
              </span>
              <button
                onClick={() => {
                  setNewTargetInput(dailyTarget);
                  setShowGoalModal(true);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title="Customize Daily Goal"
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Progress</span>
              <span>{targetProgress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Yesterday: {yesterdayCalls} calls</span>
            <span className={`font-bold flex items-center gap-0.5 ${callDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {callDiff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(callDiff)} calls vs yesterday
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Outbound Momentum & Streak
                </h4>
                <p className="text-[11px] text-slate-400">
                  Consistent dialing consistency
                </p>
              </div>
            </div>
            <span className="text-base font-black text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
              {currentStreak} Day Streak 🔥
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Total Calls
              </p>
              <p className="text-base font-black text-slate-800 dark:text-slate-200">
                {callActivities.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Meetings
              </p>
              <p className="text-base font-black text-purple-600 dark:text-purple-400">
                {meetingsBooked}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Personal Best
              </p>
              <p className="text-base font-black text-emerald-500 flex items-center justify-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> {personalBestCalls}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 90 Days Heatmap */}
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-500" /> Outbound Call Activity
            Heatmap (Last 90 Days)
          </span>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-1.5 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 justify-center">
            {gridDays.map((day, idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-xs transition-transform hover:scale-125 cursor-pointer ${getHeatColor(
                  day.count
                )}`}
                title={`${day.date}: ${day.count} calls made`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>90 days ago</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-3 rounded-xs bg-emerald-300 dark:bg-emerald-900" />
              <div className="h-3 w-3 rounded-xs bg-emerald-500 dark:bg-emerald-700" />
              <div className="h-3 w-3 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
              <span>More</span>
            </div>
            <span>Today ({todayCalls} calls)</span>
          </div>
        </div>
      </SectionCard>

      {/* New Analytics Cards: Peak Calling Hours & Conversion Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> Peak Calling Hours Analysis
            </span>
          }
        >
          <div className="space-y-3 py-2">
            {Object.entries(hourCounts).map(([slot, count], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {slot}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  {count} calls logged
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-500" /> Sales Conversion Funnel
            </span>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
              <span className="font-semibold">Total Leads Ingestion</span>
              <span className="font-bold">{totalLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-900/40">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Contacted & Reached</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{contactedLeads + warmLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-900/40">
              <span className="font-semibold text-purple-600 dark:text-purple-400">Discovery Meetings Booked</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{meetingsBooked}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Deals Closed Won</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{closedWon} ({conversionRate}%)</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-500" /> Call Outcome Breakdown
            </span>
          }
        >
          <div className="space-y-3 py-2">
            {Object.entries(outcomeCounts).map(([label, count], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </span>
                <span className="font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800">
                  {count} logs
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-500" /> Pipeline Stage Distribution
            </span>
          }
        >
          <div className="space-y-3.5 py-2">
            {[
              { label: "Cold Leads", count: coldLeads, color: "bg-slate-400" },
              { label: "Contacted", count: contactedLeads, color: "bg-blue-500" },
              { label: "Warm Prospects", count: warmLeads, color: "bg-amber-500" },
              { label: "Meeting Booked", count: meetingsBooked, color: "bg-purple-500" },
              { label: "Proposals Sent", count: proposalsSent, color: "bg-indigo-500" },
              { label: "Closed Won", count: closedWon, color: "bg-emerald-500" },
              { label: "Closed Lost", count: closedLost, color: "bg-rose-500" },
            ].map((stage, idx) => {
              const pct = getPercentage(stage.count);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      {stage.label}
                    </span>
                    <span className="text-slate-500">
                      {stage.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span>Set Daily Call Goal</span>
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveNewGoal} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Target Calls Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Goal Accomplished! 🎉
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fantastic work! You have successfully completed your daily target
                of <span className="font-bold text-emerald-400">{dailyTarget} calls</span> today. Your consistency is driving unstoppable momentum!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 font-semibold">
              🔥 Dialing Streak Maintained & Secured!
            </div>

            <Button
              onClick={() => setShowCelebration(false)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Continue Outbound Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}