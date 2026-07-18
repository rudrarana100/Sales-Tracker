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
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      {/* Executive Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={<Users className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Cold Leads"
          value={coldCallsRemaining}
          icon={<Phone className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Today's Follow-ups"
          value={followUpsToday}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Meetings Today"
          value={meetingsToday}
          icon={<Video className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Quick Actions */}
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

      {/* Agenda + Attention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Follow-ups">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-fog">
                Nothing scheduled today.
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-md border border-ash px-3 py-2 transition hover:bg-paper-mist"
                    >
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {lead.lead_name}
                        </p>

                        <p className="text-xs text-fog">{followUp.title}</p>
                      </div>

                      <span className="rounded-full bg-paper-mist px-2 py-0.5 text-[11px] font-medium text-fog">
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
              <div className="py-8 text-center text-sm text-fog">
                You're all caught up.
              </div>
            ) : (
              <div className="space-y-1.5">
                {overdueFollowUps.map((followUp) => {
                  const lead = followUp.leads;

                  return (
                    <div
                      key={followUp.id}
                      className="rounded-md border border-red-200 bg-red-50/50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-charcoal">
                        {lead.lead_name}
                      </p>

                      <p className="mt-0.5 text-xs text-red-600">
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

      {/* Recent Activity */}
      <SectionCard title="Recent Activity">
        <RecentActivity />
      </SectionCard>
    </div>
  );
}

export default Dashboard;
