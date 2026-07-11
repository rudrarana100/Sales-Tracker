import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLeadById } from "../api/leadsApi";

function LeadDetailPage() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        const data = await getLeadById(id);
        setLead(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchLead();
  }, [id]);

  if (!lead) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{lead.lead_name}</h1>

      <hr />

      <p><strong>Contact:</strong> {lead.contact_person || "--"}</p>

      <p><strong>Phone:</strong> {lead.phone || "--"}</p>

      <p><strong>Email:</strong> {lead.email || "--"}</p>

      <p><strong>Status:</strong> {lead.status}</p>

      <p><strong>Follow-up Date:</strong> {lead.follow_up_date || "--"}</p>

      <p><strong>Follow-up Time:</strong> {lead.follow_up_time || "--"}</p>

      <p><strong>Meeting Link:</strong></p>

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
  );
}

export default LeadDetailPage;