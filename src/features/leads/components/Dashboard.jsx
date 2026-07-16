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

function Dashboard({
  leads,
  onStartCalling,
  onImportClick, // <-- your CSV file picker handler
}) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const coldCallsRemaining = leads.filter(
    (lead) => lead.status === "cold"
  ).length;

  const followUpsToday = leads.filter(
    (lead) => lead.follow_up_date === today
  ).length;

  const meetingsToday = leads.filter(
    (lead) =>
      lead.status === "meeting_booked" &&
      lead.follow_up_date === today
  ).length;

  const todayTasks = leads
    .filter((lead) => lead.follow_up_date === today)
    .sort((a, b) =>
      (a.follow_up_time || "").localeCompare(b.follow_up_time || "")
    );

  const overdueFollowUps = leads
    .filter((lead) => lead.follow_up_date && lead.follow_up_date < today)
    .sort((a, b) =>
      (a.follow_up_time || "").localeCompare(b.follow_up_time || "")
    );

  function getTaskLabel(status) {
    switch (status) {
      case "meeting_booked":
        return "Google Meet";
      case "contacted":
        return "Follow-up Call";
      case "warm":
        return "Warm Lead";
      case "proposal_sent":
        return "Proposal Follow-up";
      case "cold":
        return "Cold Call";
      default:
        return status;
    }
  }

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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Cold Calls"
          value={coldCallsRemaining}
          icon={<Phone className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Follow-ups"
          value={followUpsToday}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />

        <StatCard
          title="Meetings"
          value={meetingsToday}
          icon={<Video className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/leads")}
          >
            <Users className="mr-2 h-4 w-4" />
            View All Leads
          </Button>

          <Button onClick={onStartCalling}>
            <Phone className="mr-2 h-4 w-4" />
            Start Calling
          </Button>

          <Button
            variant="outline"
            onClick={onImportClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </SectionCard>

      {/* Agenda + Attention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Today's Agenda">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-fog">
                Nothing scheduled today.
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-md border border-ash px-3 py-2 transition hover:bg-paper-mist"
                  >
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {lead.lead_name}
                      </p>

                      <p className="text-xs text-fog">
                        {getTaskLabel(lead.status)}
                      </p>
                    </div>

                    <span className="rounded-full bg-paper-mist px-2 py-0.5 text-[11px] font-medium text-fog">
                      {lead.follow_up_time || "--:--"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="xl:col-span-2">
          <SectionCard title="Needs Attention">
            {overdueFollowUps.length === 0 ? (
              <div className="py-8 text-center text-sm text-fog">
                You're all caught up.
              </div>
            ) : (
              <div className="space-y-1.5">
                {overdueFollowUps.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-md border border-red-200 bg-red-50/50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-charcoal">
                      {lead.lead_name}
                    </p>

                    <p className="mt-0.5 text-xs text-red-600">
                      Follow-up was due on {lead.follow_up_date}
                    </p>
                  </div>
                ))}
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