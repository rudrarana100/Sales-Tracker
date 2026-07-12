import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById, updateLead } from "../api/leadsApi";
import ActivityTimeline from "../components/ActivityTimeline";
import NotesPanel from "../components/NotesPanel";
import { addActivity } from "../api/activitiesApi";

function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  const [followUpDate, setFollowUpDate] = useState("");

  const [followUpTime, setFollowUpTime] = useState("");
  const [lead, setLead] = useState(null);
  const [timelineRefresh, setTimelineRefresh] = useState(0);

  useEffect(() => {
    fetchLead();
  }, [id]);

  async function fetchLead() {
    try {
      const data = await getLeadById(id);
      setLead(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLeadUpdate(values) {
    try {
      await updateLead(lead.id, values);

      if (values.status) {
        const statusLabels = {
          cold: "Cold",
          contacted: "Contacted",
          warm: "Warm",
          meeting_booked: "Meeting Booked",
          proposal_sent: "Proposal Sent",
          closed_won: "Closed Won",
          closed_lost: "Closed Lost",
        };

        await addActivity({
          lead_id: lead.id,
          activity_type: "status_change",
          description: `Status changed to ${statusLabels[values.status]}`,
        });
      }

      // Refresh lead details
      await fetchLead();

      // Refresh Activity Timeline
      setTimelineRefresh((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  }
  async function saveFollowUp() {
    try {
      await updateLead(lead.id, {
        follow_up_date: followUpDate,
        follow_up_time: followUpTime,
      });

      const formattedDate = new Date(followUpDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const formattedTime = new Date(
        `2000-01-01T${followUpTime}`,
      ).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await addActivity({
        lead_id: lead.id,
        activity_type: "follow_up",
        description: `Follow-up scheduled for ${formattedDate} at ${formattedTime}`,
      });

      await fetchLead();

      setTimelineRefresh((prev) => prev + 1);

      setFollowUpDate("");
      setFollowUpTime("");

      setShowFollowUpForm(false);
    } catch (error) {
      console.error(error);
    }
  }

  if (!lead) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <button
        onClick={() => navigate("/leads")}
        style={{ marginBottom: "20px" }}
      >
        ← Back to All Leads
      </button>

      {/* Header */}

      <div
        style={{
          borderBottom: "1px solid #ddd",
          paddingBottom: "20px",
          marginBottom: "25px",
        }}
      >
        <h1>{lead.lead_name}</h1>

        <div style={{ marginTop: "10px" }}>
          <strong>Status</strong>
          <br />

          <select
            value={lead.status}
            onChange={(e) =>
              handleLeadUpdate({
                status: e.target.value,
              })
            }
          >
            <option value="cold">Cold</option>
            <option value="contacted">Contacted</option>
            <option value="warm">Warm</option>
            <option value="meeting_booked">Meeting Booked</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
      </div>

      {/* Contact Information */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>Contact Information</h2>

        <p>
          <strong>Contact Person:</strong> {lead.contact_person || "--"}
        </p>

        <p>
          <strong>Phone:</strong> {lead.phone || "--"}
        </p>

        <p>
          <strong>Email:</strong> {lead.email || "--"}
        </p>

        <p>
          <strong>Website:</strong> {lead.website || "--"}
        </p>

        <p>
          <strong>Business Type:</strong> {lead.business_type || "--"}
        </p>
      </div>

      {/* Follow-up */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>Next Follow-up</h2>

        <p>
          <strong>Date:</strong> {lead.follow_up_date || "--"}
        </p>

        <p>
          <strong>Time:</strong> {lead.follow_up_time || "--"}
        </p>

        <button
          onClick={() => {
            setFollowUpDate(lead.follow_up_date || "");
            setFollowUpTime(lead.follow_up_time || "");
            setShowFollowUpForm(true);
          }}
        >
          {lead.follow_up_date ? "Reschedule Follow-up" : "Schedule Follow-up"}
        </button>

        {showFollowUpForm && (
          <div style={{ marginTop: "20px" }}>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />

            <br />
            <br />

            <input
              type="time"
              value={followUpTime}
              onChange={(e) => setFollowUpTime(e.target.value)}
            />

            <br />
            <br />

            <button onClick={saveFollowUp}>Save</button>

            <button
              onClick={() => setShowFollowUpForm(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Meeting */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>Meeting</h2>

        {lead.meeting_link ? (
          <a href={lead.meeting_link} target="_blank" rel="noreferrer">
            Join Google Meet
          </a>
        ) : (
          <p>No meeting scheduled.</p>
        )}
      </div>

      {/* Notes */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <NotesPanel
          leadId={lead.id}
          onNoteAdded={() => setTimelineRefresh((prev) => prev + 1)}
        />
      </div>

      {/* Activity Timeline */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
        }}
      >
        <ActivityTimeline leadId={lead.id} refreshTrigger={timelineRefresh} />
      </div>
    </div>
  );
}

export default LeadDetailPage;
