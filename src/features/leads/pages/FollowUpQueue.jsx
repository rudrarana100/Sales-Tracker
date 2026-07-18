import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Globe, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFollowUps, completeFollowUp } from "../api/followUpsApi";
import { addActivity } from "../api/activitiesApi";
import { Textarea } from "@/components/ui/textarea";

export default function FollowUpQueue() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    try {
      const data = await getFollowUps();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysQueue = data.filter((followUp) => {
        if (followUp.status !== "pending") return false;

        const date = new Date(followUp.scheduled_date);
        date.setHours(0, 0, 0, 0);

        return date.getTime() === today.getTime();
      });

      setQueue(todaysQueue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAndNext() {
    try {
      await addActivity({
        lead_id: followUp.lead_id,
        activity_type: "call",
        description: `${outcome}${notes ? ` - ${notes}` : ""}`,
      });

      await completeFollowUp(followUp.id);

      setOutcome("");
      setNotes("");

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setOutcome("");
setNotes("");
setCurrentIndex(0);
setQueue([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save follow-up.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Today's Calling Queue"
          description="Focus on one follow-up at a time."
          action={
            <Button variant="outline" onClick={() => navigate("/followups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Queue
            </Button>
          }
        />

        <div className="rounded-xl border border-ash bg-canvas-white p-12 text-center">
          <h2 className="text-2xl font-semibold">You're all caught up</h2>

          <p className="mt-2 text-fog">No follow-ups scheduled for today.</p>
        </div>
      </div>
    );
  }

  const followUp = queue[currentIndex];
  const lead = followUp.leads;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Calling Queue"
        description="Focus on one follow-up at a time."
        action={
          <Button variant="outline" onClick={() => navigate("/followups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Queue
          </Button>
        }
      />

      <div className="rounded-xl border border-ash bg-canvas-white p-8">
        <p className="text-sm text-fog">
          Follow-up {currentIndex + 1} of {queue.length}
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-charcoal">
          {lead.lead_name}
        </h1>

        <p className="mt-2 text-lg text-fog">{followUp.title}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-fog">Phone</p>
            <p className="font-medium">{lead.phone || "--"}</p>
          </div>

          <div>
            <p className="text-xs text-fog">Time</p>
            <p className="font-medium">{followUp.scheduled_time || "--"}</p>
          </div>

          <div>
            <p className="text-xs text-fog">Contact Person</p>
            <p className="font-medium">{lead.contact_person || "--"}</p>
          </div>

          <div>
            <p className="text-xs text-fog">Date</p>
            <p className="font-medium">{followUp.scheduled_date}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
  onClick={() => {
    if (!lead.phone) return;
    window.location.href = `tel:${lead.phone}`;
  }}
>
  <Phone className="mr-2 h-4 w-4" />
  Call
</Button>

          <Button
            variant="outline"
            onClick={() => {
              let p = (lead.phone || "").replace(/\D/g, "");
              if (p.length === 10) p = "91" + p;
              window.open(`https://wa.me/${p}`, "_blank");
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (!lead.website) return;

              let url = lead.website;

              if (!url.startsWith("http")) {
                url = "https://" + url;
              }

              window.open(url, "_blank");
            }}
          >
            <Globe className="mr-2 h-4 w-4" />
            Website
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (lead.google_maps_link) {
                window.open(lead.google_maps_link, "_blank");
              }
            }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Maps
          </Button>
        </div>
        <LeadInteractionPanel
  lead={lead}
  followUp={followUp}
  mode="followup"
  onFinish={async () => {
    await completeFollowUp(followUp.id);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQueue([]);
    }
  }}
/>
        <div className="mt-8 flex justify-end">
          <Button disabled={!outcome} onClick={handleSaveAndNext}>
            Save & Next
          </Button>
        </div>
      </div>
    </div>
  );
}
