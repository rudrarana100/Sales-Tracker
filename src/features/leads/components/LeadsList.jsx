import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";

function LeadsList({ leads, onStatusChange }) {
  const navigate = useNavigate();

  async function handleDelete(lead) {
    try {
      if (
        !window.confirm(`Are you sure you want to delete "${lead.lead_name}"`)
      ) {
        return;
      }

      await deleteLead(lead.id);

      await onStatusChange();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h2>All Leads</h2>

      {leads.length === 0 ? (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <h3>No leads found</h3>

          <p>Try changing your search or filter.</p>
        </div>
      ) : (
        leads.map((lead) => (
          <div
            key={lead.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "12px",
            }}
          >
            <h3
              onClick={() => navigate(`/leads/${lead.id}`)}
              style={{
                cursor: "pointer",
                color: "royalblue",
                marginBottom: "8px",
              }}
            >
              {lead.lead_name}
            </h3>

            <p>
              <strong>Contact:</strong>{" "}
              {lead.contact_person || "--"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {lead.status}
            </p>

            <p>
              <strong>Follow-up:</strong>{" "}
              {lead.follow_up_date || "--"}{" "}
              {lead.follow_up_time || ""}
            </p>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
              }}
            >

              <button
                onClick={() => handleDelete(lead)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default LeadsList;