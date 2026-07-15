import { useState } from "react";
import RecentActivity from "./RecentActivity";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SectionCard from "@/components/common/SectionCard";

import {
  Phone,
  Calendar,
  Users,
  Video,
} from "lucide-react";

function Dashboard({ leads, onStartCalling }) {
  const [showRecentActivity, setShowRecentActivity] = useState(false);

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
      (a.follow_up_time || "").localeCompare(
        b.follow_up_time || ""
      )
    );

  const overdueFollowUps = leads
    .filter(
      (lead) =>
        lead.follow_up_date &&
        lead.follow_up_date < today
    )
    .sort((a, b) =>
      (a.follow_up_time || "").localeCompare(
        b.follow_up_time || ""
      )
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
  <div className="space-y-8">
    <PageHeader
      title="Dashboard"
      description="Overview of today's sales activity."
      action={
        <Button onClick={onStartCalling}>
          Resume Calling
        </Button>
      }
    />

    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatCard
        title="Cold Calls"
        value={coldCallsRemaining}
        icon={<Phone className="h-6 w-6 text-slate-500" />}
      />

      <StatCard
        title="Follow-ups"
        value={followUpsToday}
        icon={<Calendar className="h-6 w-6 text-slate-500" />}
      />

      <StatCard
        title="Meetings"
        value={meetingsToday}
        icon={<Video className="h-6 w-6 text-slate-500" />}
      />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Needs Attention">
        {overdueFollowUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No overdue follow-ups.
          </p>
        ) : (
          overdueFollowUps.map((lead) => (
            <div
              key={lead.id}
              className="mb-3 rounded-lg border p-4"
            >
              <h4 className="font-medium">
                {lead.lead_name}
              </h4>

              <p className="text-sm text-slate-500">
                {lead.follow_up_date}
              </p>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard title="Today's Schedule">
        {todayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled today.
          </p>
        ) : (
          todayTasks.map((lead) => (
            <div
              key={lead.id}
              className="mb-3 rounded-lg border p-4"
            >
              <h4 className="font-medium">
                {lead.follow_up_time || "--:--"}
              </h4>

              <p>{lead.lead_name}</p>

              <small className="text-slate-500">
                {getTaskLabel(lead.status)}
              </small>
            </div>
          ))
        )}
      </SectionCard>
    </div>

    <SectionCard title="Recent Activity">
      <RecentActivity />
    </SectionCard>
  </div>
);
}

export default Dashboard;