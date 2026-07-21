import RecentActivity from "./RecentActivity";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SectionCard from "@/components/common/SectionCard";
import {
  Phone,
  Calendar,
  Video,
  ArrowRight,
  Upload,
  Users,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard({ leads, followUps, onStartCalling, onImportClick }) {
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
      <PageHeader
        title="Dashboard"
        description="Today's sales activity overview."
        action={
          <Button onClick={onStartCalling}>
            <Sparkles className="h-4 w-4" />
            Resume Calling
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Cold Calls"
          value={coldCallsRemaining}
          icon={<Phone className="h-4 w-4" />}
        />
        <StatCard
          title="Follow-ups Today"
          value={followUpsToday}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Meetings Today"
          value={meetingsToday}
          icon={<Video className="h-4 w-4" />}
        />
      </div>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/leads")}>
            <Users className="h-4 w-4" />
            View All Leads
          </Button>
          <Button onClick={onStartCalling}>
            <Phone className="h-4 w-4" />
            Start Calling
          </Button>
          <Button variant="outline" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Follow-ups">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Calendar className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground">Nothing scheduled today</p>
                <p className="mt-1 text-xs text-muted-foreground">You have a clear calendar. Enjoy the quiet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 transition-all duration-200 hover:shadow-subtle hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lead?.lead_name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">{followUp.title}</p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border/50">
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground">You're all caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">No overdue follow-ups. Great job!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;
                  return (
                    <div
                      key={followUp.id}
                      className="rounded-xl border border-border bg-card px-5 py-3.5 transition-all duration-200 hover:shadow-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                        <p className="text-sm font-medium text-foreground">
                          {lead?.lead_name}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground pl-4">
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

      <SectionCard title="Recent Activity">
        <RecentActivity />
      </SectionCard>
    </div>
  );
}

export default Dashboard;
