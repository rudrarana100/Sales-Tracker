import { useEffect, useState } from "react";
import { getFollowUps } from "../api/followUpsApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SectionCard from "@/components/common/SectionCard";
import PageHeader from "@/components/common/PageHeader";
import {
  Globe, MapPin, MessageCircle, ExternalLink,
  Phone, User, Clock, Calendar, AlertTriangle,
} from "lucide-react";

const statusStyles = {
  cold: "bg-blue-50 text-blue-600",
  contacted: "bg-amber-50 text-amber-600",
  warm: "bg-orange-50 text-orange-600",
  meeting_booked: "bg-purple-50 text-purple-600",
  proposal_sent: "bg-indigo-50 text-indigo-600",
  closed_won: "bg-green-50 text-green-600",
  closed_lost: "bg-red-50 text-red-600",
};

function FollowUpsPage() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFollowUps(); }, []);

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

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-fog">Loading...</div>;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
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
      <Card key={lead.id} className="border-ash shadow-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-charcoal">{lead.lead_name}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-fog">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{lead.contact_person || "--"}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{followUp.scheduled_time || "--"}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{followUp.scheduled_date}</span>
              </div>
              <Badge className={`${statusStyles[lead.status] || 'bg-paper-mist text-fog'} capitalize rounded-full`}>
                {lead.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button size="xs" variant="outline" onClick={() => { if (!lead.website) return; let u = lead.website; if (!u.startsWith("http")) u = "https://" + u; window.open(u, "_blank"); }}>
              <Globe className="h-3 w-3" /> Website
            </Button>
            <Button size="xs" variant="outline" onClick={() => { if (!lead.google_maps_link) return; window.open(lead.google_maps_link, "_blank"); }}>
              <MapPin className="h-3 w-3" /> Maps
            </Button>
            <Button size="xs" variant="outline" onClick={() => { let p = lead.phone.replace(/\D/g, ""); if (p.length === 10) p = "91" + p; window.open(`https://wa.me/${p}`, "_blank"); }}>
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </Button>
            <Button size="xs" variant="outline" onClick={() => navigate(`/leads/${lead.id}`)}>
              <ExternalLink className="h-3 w-3" /> Open
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Follow-ups" description="Manage your follow-up schedule." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Overdue", count: overdue.length, border: "border-red-200", text: "text-red-500" },
          { label: "Today", count: todayFollowUps.length, border: "border-amber-200", text: "text-amber-500" },
          { label: "Tomorrow", count: tomorrowFollowUps.length, border: "border-emerald-200", text: "text-emerald-500" },
          { label: "Upcoming", count: upcoming.length, border: "border-blue-200", text: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-canvas-white p-4`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${s.text}`}>{s.label}</p>
            <h2 className="mt-1 text-2xl font-medium text-charcoal">{s.count}</h2>
          </div>
        ))}
      </div>

      {followUps.length === 0 ? (
        <Card className="border-ash shadow-none">
          <CardContent className="py-10 text-center text-sm text-fog">No follow-ups scheduled.</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Overdue ({overdue.length})</span>}>
              <div className="space-y-2">{overdue.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {todayFollowUps.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-amber-500" /> Today ({todayFollowUps.length})</span>}>
              <div className="space-y-2">{todayFollowUps.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {tomorrowFollowUps.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-emerald-500" /> Tomorrow ({tomorrowFollowUps.length})</span>}>
              <div className="space-y-2">{tomorrowFollowUps.map(renderLeadCard)}</div>
            </SectionCard>
          )}
          {upcoming.length > 0 && (
            <SectionCard title={<span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-500" /> Upcoming ({upcoming.length})</span>}>
              <div className="space-y-2">{upcoming.map(renderLeadCard)}</div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

export default FollowUpsPage;
