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
  function sendWhatsapp() {
    if (!lead.phone) {
      alert("No phone number found.");
      return;
    }

    let phone = lead.phone.replace(/\D/g, "");

    if (phone.length === 10) phone = "91" + phone;

    const msg = `Hi ${lead.contact_person || ""},

Great speaking with you today!

As discussed, here's some information about BuiltStack.

We help businesses build modern websites that increase trust and help generate more leads.

Would love to show you a few examples on a quick Google Meet whenever you're free.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  const saveCallbackFollowUp = async () => {
    if (!callbackDate || !callbackTime) {
      alert("Please select a date and time.");
      return;
    }

    const followUpDate = `${callbackDate}T${callbackTime}:00`;

    try {
      await updateLead(lead.id, {
        follow_up_date: followUpDate,
      });

      await createFollowUp({
        lead_id: lead.id,
        type: "call",
        title:
          callbackReason === "gatekeeper"
            ? "Gatekeeper Follow-up"
            : "Callback Requested",
        notes: callbackNote,
        scheduled_date: callbackDate,
        scheduled_time: callbackTime,
        priority: "medium",
        status: "pending",
      });

      await addActivity({
        lead_id: lead.id,
        activity_type: "callback",
        description:
          callbackReason === "gatekeeper"
            ? `Gatekeeper Follow-up Scheduled. ${callbackNote}`
            : `Callback Requested. ${callbackNote}`,
      });

      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");
      setCallbackNote("");

      await finishCurrentFollowUp();
    } catch (err) {
      console.error(err);
      alert("Failed to save follow-up.");
    }
  };

  async function saveMeeting() {
    try {
      if (!meetingDate || !meetingTime) {
        alert("Please select both date and time.");
        return;
      }
      const start = new Date(`${meetingDate}T${meetingTime}`);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const meetLink = await createGoogleMeet(
        `Meeting with ${lead.lead_name}`,
        "BuiltStack Discovery Call",
        start.toISOString(),
        end.toISOString(),
      );
      await updateLead(lead.id, {
        status: "meeting_booked",
        last_outcome: "google_meet_booked",
        last_contact_date: new Date().toISOString().split("T")[0],
        meeting_link: meetLink,
      });

      await addActivity({
        lead_id: lead.id,
        activity_type: "meeting",
        description: `Google Meet booked for ${meetingDate} at ${meetingTime}`,
      });
      sendMeetingConfirmation(meetLink);
      await finishCurrentFollowUp();
      setShowMeetingForm(false);
      setMeetingDate("");
      setMeetingTime("");
    } catch (error) {
      console.error(error);
    }
  }

  function sendMeetingConfirmation(meetLink) {
    if (!lead.phone) return;
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${lead.contact_person || lead.lead_name},\n\nGreat speaking with you today!\n\nOur Google Meet has been scheduled.\n\n📅 Date: ${new Date(meetingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n🕒 Time: ${meetingTime}\n\nMeeting Link:\n${meetLink}\n\nLooking forward to speaking with you.\n\n- Rudra\nBuiltStack`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
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
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Today's Calling Queue"
          description="Focus on one follow-up at a time."
          action={
            <Button variant="outline" onClick={() => navigate("/follow-ups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Queue
            </Button>
          }
        />

        <div className="premium-card p-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            You're all caught up
          </h2>

          <p className="mt-2 text-muted-foreground">
            No follow-ups scheduled for today.
          </p>
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
          <Button variant="outline" onClick={() => navigate("/follow-ups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Queue
          </Button>
        }
      />

      <div className="premium-card p-8">
        <p className="text-sm text-muted-foreground">
          Follow-up {currentIndex + 1} of {queue.length}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {lead.lead_name}
        </h1>

        <p className="mt-2 text-lg text-muted-foreground">{followUp.title}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">{lead.phone || "--"}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-medium text-foreground">
              {followUp.scheduled_time || "--"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Contact Person</p>
            <p className="font-medium text-foreground">
              {lead.contact_person || "--"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">
              {followUp.scheduled_date}
            </p>
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

        <Card className="mt-8 premium-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Call Outcome</CardTitle>
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
              className="w-full justify-start border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
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
          <Card className="mt-5 premium-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="h-4 w-4" /> Prospect Interested
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => {
                  sendWhatsapp();
                  setShowInterestedActions(false);
                  setShowFollowUpModal(true);
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

        {showMeetingForm && (
          <Card className="mt-5 premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Video className="h-4 w-4" /> Book Google Meet
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />

              <Input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />

              <div className="flex gap-2">
                <Button onClick={saveMeeting}>Create Meet</Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMeetingForm(false);
                    setMeetingDate("");
                    setMeetingTime("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showCallbackForm && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                {callbackReason === "gatekeeper"
                  ? "Gatekeeper Follow-up"
                  : "Callback Requested"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Input
                type="date"
                value={callbackDate}
                onChange={(e) => setCallbackDate(e.target.value)}
              />

              <Input
                type="time"
                value={callbackTime}
                onChange={(e) => setCallbackTime(e.target.value)}
              />

              <textarea
                className="min-h-24 w-full rounded-lg border p-2"
                placeholder="Notes..."
                value={callbackNote}
                onChange={(e) => setCallbackNote(e.target.value)}
              />

              <div className="flex gap-2">
                <Button onClick={saveCallbackFollowUp}>Save Follow-up</Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCallbackForm(false);
                    setCallbackDate("");
                    setCallbackTime("");
                    setCallbackNote("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex justify-end"></div>
      </div>

      <ScheduleFollowUpModal
        open={showFollowUpModal}
        lead={lead}
        onClose={() => setShowFollowUpModal(false)}
        onSaved={async () => {
          await updateLead(lead.id, {
            status: "warm",
            last_outcome: "interested",
            last_contact_date: new Date().toISOString().split("T")[0],
          });

          await addActivity({
            lead_id: lead.id,
            activity_type: "status_change",
            description: "Lead marked as Interested",
          });

          await finishCurrentFollowUp();
        }}
      />
    </div>
  );
}
