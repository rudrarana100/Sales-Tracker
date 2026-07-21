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
    <div className="space-y-6">
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
          accent="bg-red-500/10 text-red-500"
        />

        <StatCard
          title="Meetings Today"
          value={meetingsToday}
          icon={<Video className="h-4 w-4" />}
        />
      </div>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate("/leads")}>
            <Users className="mr-2 h-4 w-4" />
            View All Leads
          </Button>

          <Button onClick={onStartCalling}>
            <Phone className="mr-2 h-4 w-4" />
            Start Calling
          </Button>

          <Button variant="outline" onClick={onImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Follow-ups">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nothing scheduled today.
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5 transition hover:bg-accent"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {lead.lead_name}
                        </p>

                        <p className="text-xs text-muted-foreground">{followUp.title}</p>
                      </div>

                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
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
              <div className="py-8 text-center text-sm text-muted-foreground">
                You're all caught up.
              </div>
            ) : (
              <div className="space-y-1.5">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {lead.lead_name}
                      </p>

                      <p className="mt-0.5 text-xs text-red-500">
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
