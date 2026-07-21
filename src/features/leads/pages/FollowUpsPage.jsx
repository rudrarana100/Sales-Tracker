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
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

const statusStyles = {
  cold: "bg-paper text-fog border border-border",
  contacted: "bg-paper text-graphite border border-border",
  warm: "bg-paper text-graphite border border-border font-medium",
  meeting_booked: "bg-obsidian text-snow border border-obsidian",
  proposal_sent: "bg-obsidian text-snow border border-obsidian",
  closed_won: "bg-ember text-snow border border-ember",
  closed_lost: "bg-paper text-fog border border-border line-through",
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
    try {
      await completeFollowUp(followUp.id);

      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_completed",
        description: `Completed follow-up: ${followUp.title}`,
      });

      toast.success("Follow-up completed");
      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete follow-up.");
    }
  }
  async function handleSkip(followUp) {
    try {
      await skipFollowUp(followUp.id);

      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "follow_up_skipped",
        description: `Skipped follow-up: ${followUp.title}`,
      });

      toast.success("Follow-up skipped");
      await fetchFollowUps();
    } catch (error) {
      console.error(error);
      toast.error("Failed to skip follow-up.");
    }
  }
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="text-sm text-muted-foreground">Loading follow-ups...</p>
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
      <Card key={followUp.id} className="card-hairline">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-card-foreground">
                {lead?.lead_name}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {lead?.contact_person || "--"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead?.phone}
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
                className={`${statusStyles[lead?.status] || "bg-muted text-muted-foreground"} capitalize rounded-xl`}
              >
                {lead?.status?.replace(/_/g, " ") || "--"}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                if (!lead?.website) return;
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
                if (!lead?.google_maps_link) return;
                window.open(lead.google_maps_link, "_blank");
              }}
            >
              <MapPin className="h-3 w-3" /> Maps
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                let p = (lead?.phone || "").replace(/\D/g, "");
                if (p.length === 10) p = "91" + p;
                window.open(`https://wa.me/${p}`, "_blank");
              }}
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate(`/leads/${lead?.id}`)}
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
    <div className="space-y-5">
      <PageHeader
        title="Follow-ups"
        description="Manage your follow-up schedule."
        action={
          <Button size="sm" onClick={() => navigate("/followups/queue")}>
            Start Today's Follow-ups
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Overdue",
            count: overdue.length,
            accent: "text-fog",
            bg: "bg-paper",
            icon: AlertTriangle,
          },
          {
            label: "Today",
            count: todayFollowUps.length,
            accent: "text-graphite",
            bg: "bg-paper",
            icon: CalendarDays,
          },
          {
            label: "Tomorrow",
            count: tomorrowFollowUps.length,
            accent: "text-graphite",
            bg: "bg-paper",
            icon: Clock,
          },
          {
            label: "Upcoming",
            count: upcoming.length,
            accent: "text-fog",
            bg: "bg-paper",
            icon: Calendar,
          },
        ].map((s) => (
          <Card key={s.label} className="card-hairline">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${s.accent}`}>
                  {s.label}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-card-foreground">
                  {s.count}
                </h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-fog border border-border">
                <s.icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {followUps.length === 0 ? (
        <Card className="card-hairline">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No follow-ups scheduled.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {overdue.length > 0 && (
            <SectionCard
              title={
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" /> Overdue
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
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Today (
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
                  <Clock className="h-4 w-4 text-muted-foreground" /> Tomorrow (
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
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Upcoming (
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
