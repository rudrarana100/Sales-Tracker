import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";
import { useNavigate } from "react-router-dom";

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

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

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) return;

    const labels = {
      cold: "Cold",
      contacted: "Contacted",
      warm: "Warm",
      meeting_booked: "Meeting Booked",
      proposal_sent: "Proposal Sent",
      closed_won: "Closed Won",
      closed_lost: "Closed Lost",
    };

    try {
      await updateLead(draggableId, {
        status: destination.droppableId,
      });

      await addActivity({
        lead_id: draggableId,
        activity_type: "status_change",
        description: `Moved to ${labels[destination.droppableId]}`,
      });

      await fetchLeads();
    } catch (error) {
      console.error(error);
    }
  }

  function renderLeadCard(lead, index) {
    return (
      <Draggable draggableId={String(lead.id)} index={index} key={lead.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "12px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              ...provided.draggableProps.style,
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>{lead.lead_name}</h4>

            <p>👤 {lead.contact_person || "--"}</p>

            <p>📞 {lead.phone}</p>

            <p>🏢 {lead.business_type || "--"}</p>

            <p>
              {lead.follow_up_date
                ? `📅 ${new Date(lead.follow_up_date).toLocaleDateString(
                    "en-IN",
                  )}`
                : "No Follow-up"}
            </p>

            <p>🕒 {lead.follow_up_time || "--"}</p>

            <hr />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Website */}
              <button
                onClick={() => {
                  if (!lead.website) {
                    alert("No website");
                    return;
                  }

                  let url = lead.website;

                  if (!url.startsWith("http")) {
                    url = "https://" + url;
                  }

                  window.open(url, "_blank");
                }}
              >
                🌐
              </button>

              {/* Maps */}
              <button
                onClick={() => {
                  if (!lead.google_maps_link) {
                    alert("No Maps Link");
                    return;
                  }

                  window.open(lead.google_maps_link, "_blank");
                }}
              >
                📍
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => {
                  let phone = lead.phone.replace(/\D/g, "");

                  if (phone.length === 10) {
                    phone = "91" + phone;
                  }

                  window.open(`https://wa.me/${phone}`, "_blank");
                }}
              >
                💬
              </button>

              {/* Copy Phone */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lead.phone);
                  alert("Phone copied!");
                }}
              >
                📋
              </button>

              {/* Open Lead */}
              <button onClick={() => navigate(`/leads/${lead.id}`)}>👀</button>
            </div>
          </div>
        )}
      </Draggable>
    );
  }

  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase();

    return (
      lead.lead_name?.toLowerCase().includes(search) ||
      lead.contact_person?.toLowerCase().includes(search) ||
      lead.phone?.includes(search)
    );
  });

  const columns = {
    contacted: filteredLeads.filter((lead) => lead.status === "contacted"),
    warm: filteredLeads.filter((lead) => lead.status === "warm"),
    meeting_booked: filteredLeads.filter(
      (lead) => lead.status === "meeting_booked",
    ),
    proposal_sent: filteredLeads.filter(
      (lead) => lead.status === "proposal_sent",
    ),
    closed_won: filteredLeads.filter((lead) => lead.status === "closed_won"),
    closed_lost: filteredLeads.filter((lead) => lead.status === "closed_lost"),
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Deal Pipeline</h1>
      <input
        type="text"
        placeholder="🔍 Search by lead, contact or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "350px",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            alignItems: "flex-start",
          }}
        >
          {[
            ["Contacted", "contacted"],
            ["Warm", "warm"],
            ["Meeting", "meeting_booked"],
            ["Proposal", "proposal_sent"],
            ["Won", "closed_won"],
            ["Lost", "closed_lost"],
          ].map(([title, key]) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minWidth: "250px",
                    background: "#f5f5f5",
                    padding: "15px",
                    borderRadius: "10px",
                    minHeight: "500px",
                  }}
                >
                  <h3>
                    {title} ({columns[key].length})
                  </h3>

                  {columns[key].length === 0 ? (
                    <p
                      style={{
                        color: "#888",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      No active deals
                    </p>
                  ) : (
                    columns[key].map((lead, index) =>
                      renderLeadCard(lead, index),
                    )
                  )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default PipelinePage;
