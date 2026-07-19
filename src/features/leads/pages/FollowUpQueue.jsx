import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Globe, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFollowUps, completeFollowUp } from "../api/followUpsApi";
import { addActivity } from "../api/activitiesApi";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ThumbsUp,
  ThumbsDown,
  PhoneOff,
  Shield,
  CalendarCheck,
  Video,
  Calendar,
  XCircle,
} from "lucide-react";

import { updateLead } from "../api/leadsApi";
import { createFollowUp } from "../api/followUpsApi";
import { createGoogleMeet } from "@/utils/meetingUtils";
import ScheduleFollowUpModal from "../components/followups/ScheduleFollowUpModal";

export default function FollowUpQueue() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const [showCallbackForm, setShowCallbackForm] = useState(false);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackReason, setCallbackReason] = useState("");

  async function finishCurrentFollowUp() {
    await completeFollowUp(followUp.id);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setQueue([]);
    }
  }

  const outcomeConfig = {
    interested: { status: "warm" },
    no_answer: { status: "cold" },
    gatekeeper: { status: "contacted" },
    callback_requested: { status: "contacted" },
    not_interested: { status: "closed_lost" },
  };

  async function handleOutcome(outcome) {
    try {
      if (outcome === "interested") {
        setShowInterestedActions(true);
        return;
      }

      if (outcome === "callback_requested") {
        setCallbackReason("callback");
        setShowCallbackForm(true);
        return;
      }

      if (outcome === "gatekeeper") {
        setCallbackReason("gatekeeper");
        setShowCallbackForm(true);
        return;
      }

      if (outcome === "no_answer") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await createFollowUp({
          lead_id: lead.id,
          type: "call",
          title: "No Answer Follow-up",
          notes: "Retry call.",
          scheduled_date: tomorrow.toISOString().split("T")[0],
          scheduled_time: null,
          priority: "medium",
          status: "pending",
        });
      }

      await updateLead(lead.id, {
        status: outcomeConfig[outcome].status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      });

      await addActivity({
        lead_id: lead.id,
        activity_type: "call_outcome",
        description: outcome.replaceAll("_", " "),
      });

      await finishCurrentFollowUp();
    } catch (err) {
      console.error(err);
    }
  }

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

  useEffect(() => {
    fetchQueue();
  }, []);

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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Call Outcome</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleOutcome("no_answer")}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              No Answer
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleOutcome("gatekeeper")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Gatekeeper
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleOutcome("callback_requested")}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Callback Requested
            </Button>

            <Button
              className="w-full justify-start border-green-200 text-green-700"
              variant="outline"
              onClick={() => handleOutcome("interested")}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Interested
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleOutcome("not_interested")}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not Interested
            </Button>
          </CardContent>
        </Card>

        {showInterestedActions && (
  <Card className="mt-4 border-green-200">
    <CardHeader>
      <CardTitle>Prospect Interested</CardTitle>
    </CardHeader>

    <CardContent className="space-y-2">
      <Button
        className="w-full"
        onClick={() => {
          // we'll replace this with sendWhatsapp() next
        }}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Send WhatsApp
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setShowInterestedActions(false);
          setShowMeetingForm(true);
        }}
      >
        <Video className="mr-2 h-4 w-4" />
        Book Google Meet
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setShowInterestedActions(false);
          setShowFollowUpModal(true);
        }}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Follow-up
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setShowInterestedActions(false)}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </CardContent>
  </Card>
)}

        <div className="mt-8 flex justify-end"></div>
      </div>
    </div>
  );
}
