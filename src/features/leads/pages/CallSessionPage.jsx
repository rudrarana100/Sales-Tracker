import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const [meetingDate, setMeetingDate] = useState("");

  const [meetingTime, setMeetingTime] = useState("");

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const coldLeads = leads.filter((lead) => lead.status === "cold");
  const currentLead = coldLeads[0];

  const outcomeConfig = {
    interested: {
      status: "warm",
    },
    no_answer: {
      status: "cold",
    },
    invalid_number: {
      status: "closed_lost",
    },
    gatekeeper: {
      status: "cold",
    },
    not_interested: {
      status: "closed_lost",
    },
  };

  async function handleOutcome(outcome) {
    try {
      if (!currentLead) return;

      if (outcome === "callback_requested") {
        setShowCallbackForm(true);
        return;
      }

      if (outcome === "interested") {
        setShowInterestedActions(true);
        return;
      }

      const config = outcomeConfig[outcome];

      await updateLead(currentLead.id, {
        status: config.status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      await addActivity({
        lead_id: currentLead.id,
        activity_type: "call_outcome",
        description: outcome,
      });

      await fetchLeads();

      setShowInterestedActions(false);
    } catch (error) {
      console.error(error);
    }
  }

  function sendWhatsapp() {
    console.log(currentLead);
    console.log(currentLead.phone);
    if (!currentLead.phone) {
      alert("No phone number found.");
      return;
    }

    let phone = currentLead.phone.replace(/\D/g, "");

    if (phone.length === 10) {
      phone = "91" + phone;
    }

    const message = `Hi ${currentLead.contact_person || ""},
    Great speaking with you today!

As discussed, here's some information about BuiltStack.

We help businesses build modern websites that increase trust and help generate more leads.

Would love to show you a few examples on a quick Google Meet whenever you're free.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  async function markInterested() {
    try {
      await updateLead(currentLead.id, {
        status: "warm",
        last_outcome: "interested",
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      await addActivity({
        lead_id: currentLead.id,
        activity_type: "status_change",
        description: "Lead marked as Interested",
      });

      setShowInterestedActions(false);

      await fetchLeads();
    } catch (error) {
      console.error(error);
    }
  }

  async function saveCallback() {
    try {
      if (!callbackDate || !callbackTime) {
        alert("Please select both date and time.");
        return;
      }

      await updateLead(currentLead.id, {
        status: "contacted",
        last_outcome: "callback_requested",
        last_contact_date: new Date().toISOString().split("T")[0],
        follow_up_date: callbackDate,
        follow_up_time: callbackTime,
      });

      await addActivity({
        lead_id: currentLead.id,
        activity_type: "callback",
        description: `Callback scheduled for ${callbackDate} at ${callbackTime}`,
      });

      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");

      await fetchLeads();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (coldLeads.length === 0) {
    return (
      <div>
        <h1>🎉 Session Complete</h1>
        <p>No cold leads remaining.</p>
      </div>
    );
  }


  function formatDisplayDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function sendMeetingConfirmation(meetLink) {
    if (!currentLead.phone) {
      alert("No phone number found.");
      return;
    }

    let phone = currentLead.phone.replace(/\D/g, "");

    if (phone.length === 10) {
      phone = "91" + phone;
    }

    const message = `Hi ${currentLead.contact_person || currentLead.lead_name},

Great speaking with you today!

Our Google Meet has been scheduled.

📅 Date: ${formatDisplayDate(meetingDate)}
🕒 Time: ${meetingTime}

Meeting Link:
${meetLink}

Looking forward to speaking with you.

- Rudra
BuiltStack`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

async function saveMeeting() {
  try {
    if (!meetingDate || !meetingTime) {
      alert("Please select both date and time.");
      return;
    }

    const start = new Date(`${meetingDate}T${meetingTime}`);

    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const meetLink = await createGoogleMeet(
      `Meeting with ${currentLead.lead_name}`,
      "BuiltStack Discovery Call",
      start.toISOString(),
      end.toISOString()
    );

    await updateLead(currentLead.id, {
      status: "meeting_booked",
      last_outcome: "google_meet_booked",
      last_contact_date: new Date().toISOString().split("T")[0],
      follow_up_date: meetingDate,
      follow_up_time: meetingTime,
      meeting_link: meetLink,
    });

    await addActivity({
      lead_id: currentLead.id,
      activity_type: "meeting",
      description: `Google Meet booked for ${meetingDate} at ${meetingTime}`,
    });

    sendMeetingConfirmation(meetLink);

    setShowMeetingForm(false);
    setMeetingDate("");
    setMeetingTime("");

    await fetchLeads();
  } catch (error) {
    console.error(error);
  }
}

  return (
    <div>
      <h1>Cold Call Session</h1>

      <p>Lead 1 / {coldLeads.length}</p>

      <h2>{currentLead.lead_name}</h2>

      <p>{currentLead.contact_person || "No Contact Person"}</p>

      <p>{currentLead.phone || "No Phone Number"}</p>

      <button onClick={() => handleOutcome("no_answer")}>📵 No Answer</button>

      <button onClick={() => handleOutcome("invalid_number")}>
        🚫 Invalid Number
      </button>

      <button onClick={() => handleOutcome("gatekeeper")}>👤 Gatekeeper</button>

      <button onClick={() => handleOutcome("callback_requested")}>
        📅 Callback Requested
      </button>

      <button onClick={() => handleOutcome("not_interested")}>
        🙅 Not Interested
      </button>

      <button onClick={() => handleOutcome("interested")}>🟢 Interested</button>

      {showCallbackForm && (
        <div>
          <h3>Schedule Callback</h3>

          <input
            type="date"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
          />

          <input
            type="time"
            value={callbackTime}
            onChange={(e) => setCallbackTime(e.target.value)}
          />

          <button onClick={saveCallback}>Save Callback</button>
        </div>
      )}
      {showMeetingForm && (
        <div>
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />

          <input
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          <button onClick={saveMeeting}>Confirm Meeting</button>
        </div>
      )}
      {showInterestedActions && (
        <div>
          <h3>Prospect Interested</h3>

          <button
            onClick={async () => {
              await markInterested();
              sendWhatsapp();
            }}
          >
            Send Whatsapp
          </button>

          <button
            onClick={() => {
              setShowInterestedActions(false);
              setShowMeetingForm(true);
            }}
          >
            Book Google Meet
          </button>

          <button>Skip</button>
        </div>
      )}
    </div>
  );
}

export default CallSessionPage;
