import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { createGoogleMeet } from "../../../utils/meetingUtils";
import { getNotes } from "../api/notesApi";
import { getActivities } from "../api/activitiesApi";

const statusLabels = {
  cold: "❄️ Cold",
  contacted: "📞 Contacted",
  warm: "🔥 Warm",
  meeting_booked: "🎥 Meeting Booked",
  proposal_sent: "📄 Proposal Sent",
  closed_won: "✅ Closed Won",
  closed_lost: "❌ Closed Lost",
};

const outcomeLabels = {
  no_answer: "📵 No Answer",
  callback_requested: "📅 Callback Requested",
  interested: "🟢 Interested",
  invalid_number: "🚫 Invalid Number",
  gatekeeper: "👤 Gatekeeper",
  not_interested: "🙅 Not Interested",
  google_meet_booked: "🎥 Google Meet Booked",
};

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [showInterestedActions, setShowInterestedActions] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);

  const [meetingDate, setMeetingDate] = useState("");

  const [meetingTime, setMeetingTime] = useState("");

  const [skippedLeadIds, setSkippedLeadIds] = useState([]);

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

  async function fetchNotes(leadId) {
    try {
      const data = await getNotes(leadId);

      setNotes(data.slice(0, 3));
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchActivities(leadId) {
    try {
      const data = await getActivities(leadId);

      setActivities(data.slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    if (currentLead) {
      fetchNotes(currentLead.id);
      fetchActivities(currentLead.id);
    }
  }, [currentLead]);

function skipLead() {
  setSkippedLeadIds((prev) => [...prev, currentLead.id]);
}

  const coldLeads = leads.filter(
  (lead) =>
    lead.status === "cold" &&
    !skippedLeadIds.includes(lead.id)
);
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
        end.toISOString(),
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

      <p>👤 {currentLead.contact_person || "No Contact Person"}</p>

      <p>📞 {currentLead.phone || "--"}</p>

      <p>✉️ {currentLead.email || "--"}</p>

      <p>🌐 {currentLead.website || "--"}</p>

      <p>🏢 {currentLead.business_type || "--"}</p>

      <p>📌 Status: {statusLabels[currentLead.status] || currentLead.status}</p>

      <p>
        📅 Last Contact:{" "}
        {currentLead.last_contact_date
          ? new Date(currentLead.last_contact_date).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            )
          : "--"}
      </p>

      <h3>Quick Actions</h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => {
            if (!currentLead.website) {
              alert("No website available.");
              return;
            }

            let url = currentLead.website;

            if (!url.startsWith("http")) {
              url = "https://" + url;
            }

            window.open(url, "_blank");
          }}
        >
          🌐 Website
        </button>

        <button
          onClick={() => {
            if (!currentLead.google_maps_link) {
              alert("Google Maps link not available.");
              return;
            }

            window.open(currentLead.google_maps_link, "_blank");
          }}
        >
          📍 Maps
        </button>

        <button
          onClick={() => {
            if (!currentLead.email) {
              alert("No email available.");
              return;
            }

            window.location.href = `mailto:${currentLead.email}`;
          }}
        >
          📧 Email
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(currentLead.phone);
            alert("Phone copied!");
          }}
        >
          📋 Copy Phone
        </button>

        <button onClick={sendWhatsapp}>💬 WhatsApp</button>
      </div>

      <hr />

      <h3>Previous Interaction</h3>

      <p>
        <strong>Status:</strong>{" "}
        {statusLabels[currentLead.status] || currentLead.status}
      </p>

      <p>
        <strong>Last Outcome:</strong>{" "}
        {outcomeLabels[currentLead.last_outcome] ||
          currentLead.last_outcome ||
          "--"}
      </p>

      <p>
        <strong>Last Contact:</strong>{" "}
        {currentLead.last_contact_date
          ? new Date(currentLead.last_contact_date).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            )
          : "--"}
      </p>

      <p>
        <strong>Next Follow-up:</strong>{" "}
        {currentLead.follow_up_date
          ? new Date(currentLead.follow_up_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "--"}
      </p>

      <p>
        <strong>Follow-up Time:</strong> {currentLead.follow_up_time || "--"}
      </p>

      <hr />

      <h3>Recent Notes</h3>

      {notes.length === 0 ? (
        <p>No notes available.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <p>{note.content}</p>

            <small>
              {new Date(note.created_at).toLocaleDateString("en-IN")}
            </small>
          </div>
        ))
      )}

      <hr />

      <h3>Recent Activity</h3>

      {activities.length === 0 ? (
        <p>No activity found.</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <p>{activity.description}</p>

            <small>
              {new Date(activity.created_at).toLocaleString("en-IN")}
            </small>
          </div>
        ))
      )}

      <hr />

      <h3>Call Outcome</h3>

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

      <button onClick={skipLead}>⏭️ Skip Lead</button>

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
            Send WhatsApp
          </button>

          <button
            onClick={() => {
              setShowInterestedActions(false);
              setShowMeetingForm(true);
            }}
          >
            Book Google Meet
          </button>

          <button onClick={() => setShowInterestedActions(false)}>Skip</button>
        </div>
      )}
    </div>
  );
}

export default CallSessionPage;
