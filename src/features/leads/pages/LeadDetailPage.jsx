import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeadById, updateLead } from "../api/leadsApi";
import ActivityTimeline from "../components/ActivityTimeline";
import NotesPanel from "../components/NotesPanel";

function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);

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
      await fetchLead();
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
          <strong>Contact Person:</strong>{" "}
          {lead.contact_person || "--"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {lead.phone || "--"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {lead.email || "--"}
        </p>

        <p>
          <strong>Website:</strong>{" "}
          {lead.website || "--"}
        </p>

        <p>
          <strong>Business Type:</strong>{" "}
          {lead.business_type || "--"}
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

        <div style={{ marginBottom: "15px" }}>
          <strong>Date</strong>
          <br />

          <input
            type="date"
            value={lead.follow_up_date || ""}
            onChange={(e) =>
              handleLeadUpdate({
                follow_up_date: e.target.value,
              })
            }
          />
        </div>

        <div>
          <strong>Time</strong>
          <br />

          <input
            type="time"
            value={lead.follow_up_time || ""}
            onChange={(e) =>
              handleLeadUpdate({
                follow_up_time: e.target.value,
              })
            }
          />
        </div>
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
          <a
            href={lead.meeting_link}
            target="_blank"
            rel="noreferrer"
          >
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
        <NotesPanel leadId={lead.id} />
      </div>

      {/* Activity Timeline */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
        }}
      >
        <ActivityTimeline leadId={lead.id} />
      </div>
    </div>
  );
}

export default LeadDetailPage;