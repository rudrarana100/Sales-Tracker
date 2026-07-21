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
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Today's sales activity overview."
        action={
          <Button size="sm" onClick={onStartCalling}>
            Resume Calling
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          title="Cold Leads"
          value={coldCallsRemaining}
          icon={<Phone className="h-4 w-4" />}
        />

        <StatCard
          title="Today's Follow-ups"
          value={followUpsToday}
          icon={<Calendar className="h-4 w-4" />}
        />

        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={<Calendar className="h-4 w-4" />}
        />

        <StatCard
          title="Meetings Today"
          value={meetingsToday}
          icon={<Video className="h-4 w-4" />}
        />
      </div>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
            <Users className="mr-1.5 h-4 w-4" />
            View All Leads
          </Button>

          <Button size="sm" onClick={onStartCalling}>
            <Phone className="mr-1.5 h-4 w-4" />
            Start Calling
          </Button>

          <Button variant="outline" size="sm" onClick={onImportClick}>
            <Upload className="mr-1.5 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Follow-ups">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nothing scheduled today.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lead?.lead_name}
                        </p>

                        <p className="text-xs text-muted-foreground truncate">{followUp.title}</p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-paper border border-border px-2.5 py-0.5 text-xs font-medium text-fog">
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
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="rounded-xl border border-border bg-paper px-4 py-3"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {lead?.lead_name}
                      </p>

                      <p className="mt-0.5 text-xs text-fog">
                        {followUp.title} was due on {followUp.scheduled_date}
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
