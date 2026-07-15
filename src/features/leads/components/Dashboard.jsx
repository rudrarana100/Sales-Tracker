import { useState } from "react";
import RecentActivity from "./RecentActivity";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SectionCard from "@/components/common/SectionCard";

import {
  Phone,
  Calendar,
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
  <div className="space-y-6">
    <PageHeader
      title="Dashboard"
      description="Manage today's sales activity."
      action={
        <Button className="rounded-lg px-5" onClick={onStartCalling}>
          Resume Calling
        </Button>
      }
    />

    {/* Stats */}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <StatCard
        title="Cold Calls"
        value={coldCallsRemaining}
        icon={<Phone className="h-5 w-5" />}
      />

      <StatCard
        title="Follow-ups"
        value={followUpsToday}
        icon={<Calendar className="h-5 w-5" />}
      />

      <StatCard
        title="Meetings"
        value={meetingsToday}
        icon={<Video className="h-5 w-5" />}
      />
    </div>

    {/* Agenda + Attention */}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Today's Agenda */}
      <div className="xl:col-span-3">
        <SectionCard title="Today's Agenda">
          {todayTasks.length === 0 ? (
            <div className="py-10 text-center text-zinc-500">
              Nothing scheduled today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium">
                      {lead.lead_name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {getTaskLabel(lead.status)}
                    </p>
                  </div>

                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
                    {lead.follow_up_time || "--:--"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Needs Attention */}
      <div className="xl:col-span-2">
        <SectionCard title="Needs Attention">
          {overdueFollowUps.length === 0 ? (
            <div className="py-10 text-center text-zinc-500">
              You're all caught up.
            </div>
          ) : (
            <div className="space-y-2">
              {overdueFollowUps.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border border-red-100 bg-red-50 p-3"
                >
                  <p className="font-medium">
                    {lead.lead_name}
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    Follow-up was due on {lead.follow_up_date}
                  </p>
                </div>
              ))}
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