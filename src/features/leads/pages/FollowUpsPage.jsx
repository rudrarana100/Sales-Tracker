import { useEffect, useState } from "react";
import {
  getFollowUps,
  completeFollowUp,
  skipFollowUp,
} from "../api/followUpsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SectionCard from "@/components/common/SectionCard";
import { addActivity } from "../api/activitiesApi";
import PageHeader from "@/components/common/PageHeader";
import ScheduleFollowUpModal from "../components/followups/ScheduleFollowUpModal";
import {
  Globe,
  MapPin,
  MessageCircle,
  ExternalLink,
  Phone,
  User,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const statusStyles = {
  cold: "bg-accent text-muted-foreground",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  warm: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  meeting_booked: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  proposal_sent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  closed_won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed_lost: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function FollowUpsPage() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  async function fetchFollowUps() {
    try {
      const data = await getFollowUps();
      setFollowUps(data.filter((f) => f.status === "pending"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(followUp) {
    const confirmed = window.confirm(`Mark "${followUp.title}" as completed?`);

    if (!confirmed) return;

    try {
      await completeFollowUp(followUp.id);

      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_completed",
        description: `Completed follow-up: ${followUp.title}`,
      });

      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      alert("Failed to complete follow-up.");
    }
  }
  async function handleSkip(followUp) {
    const confirmed = window.confirm(`Skip "${followUp.title}"?`);

    if (!confirmed) return;

    try {
      await skipFollowUp(followUp.id);

      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_skipped",
        description: `Skipped follow-up: ${followUp.title}`,
      });

      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      alert("Failed to skip follow-up.");
    }
  }
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const overdue = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });

  const todayFollowUps = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const tomorrowFollowUps = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === tomorrow.getTime();
  });

  const upcoming = followUps.filter((followUp) => {
    const d = new Date(followUp.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d > tomorrow;
  });

  function renderLeadCard(followUp) {
    const lead = followUp.leads;
    return (
      <Card key={followUp.id} className="premium-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-foreground">
                {lead.lead_name}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {lead.contact_person || "--"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {followUp.scheduled_time || "--"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {followUp.scheduled_date}
                </span>
              </div>
              <Badge
                className={`${statusStyles[lead.status] || "bg-accent text-muted-foreground"} capitalize rounded-full`}
              >
                {lead.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                if (!lead.website) return;
                let u = lead.website;
                if (!u.startsWith("http")) u = "https://" + u;
                window.open(u, "_blank");
              }}
            >
              <Globe className="h-3 w-3" /> Website
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                if (!lead.google_maps_link) return;
                window.open(lead.google_maps_link, "_blank");
              }}
            >
              <MapPin className="h-3 w-3" /> Maps
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                let p = lead.phone.replace(/\D/g, "");
                if (p.length === 10) p = "91" + p;
                window.open(`https://wa.me/${p}`, "_blank");
              }}
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <ExternalLink className="h-3 w-3" /> Open
            </Button>
            <Button size="xs" onClick={() => handleComplete(followUp)}>
              Complete
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setEditingFollowUp(followUp);
                setShowRescheduleModal(true);
              }}
            >
              Reschedule
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => handleSkip(followUp)}
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Manage your follow-up schedule."
        action={
          <Button onClick={() => navigate("/followups/queue")}>
            Start Today's Follow-ups
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Overdue",
            count: overdue.length,
            accent: "text-red-500",
            bg: "bg-red-500/10",
          },
          {
            label: "Today",
            count: todayFollowUps.length,
            accent: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Tomorrow",
            count: tomorrowFollowUps.length,
            accent: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Upcoming",
            count: upcoming.length,
            accent: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="premium-card p-5"
          >
            <p
              className={`text-xs font-medium uppercase tracking-wider ${s.accent}`}
            >
              {s.label}
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
              {s.count}
            </h2>
          </div>
        ))}
      </div>

      {followUps.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No follow-ups scheduled.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <SectionCard
              title={
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Overdue
                  ({overdue.length})
                </span>
              }
            >
              <div className="space-y-2">{overdue.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {todayFollowUps.length > 0 && (
            <SectionCard
              title={
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500" /> Today (
                  {todayFollowUps.length})
                </span>
              }
            >
              <div className="space-y-2">
                {todayFollowUps.map(renderLeadCard)}
              </div>
            </SectionCard>
          )}
          {tomorrowFollowUps.length > 0 && (
            <SectionCard
              title={
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-500" /> Tomorrow (
                  {tomorrowFollowUps.length})
                </span>
              }
            >
              <div className="space-y-2">
                {tomorrowFollowUps.map(renderLeadCard)}
              </div>
            </SectionCard>
          )}
          {upcoming.length > 0 && (
            <SectionCard
              title={
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-500" /> Upcoming (
                  {upcoming.length})
                </span>
              }
            >
              <div className="space-y-2">{upcoming.map(renderLeadCard)}</div>
            </SectionCard>
          )}
        </div>
      )}
      <ScheduleFollowUpModal
        lead={editingFollowUp?.leads}
        followUp={editingFollowUp}
        open={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setEditingFollowUp(null);
        }}
        onSaved={fetchFollowUps}
      />
    </div>
  );
}

export default FollowUpsPage;
