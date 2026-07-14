import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { getLeads, updateLead } from "../api/leadsApi";
import { addActivity } from "../api/activitiesApi";

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

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

  try {
    await updateLead(draggableId, {
      status: destination.droppableId,
    });

    await addActivity({
      lead_id: draggableId,
      activity_type: "status_change",
      description: `Moved to ${destination.droppableId.replace("_", " ")}`,
    });

    fetchLeads();
  } catch (error) {
    console.error(error);
  }
}

  function renderLeadCard(lead) {
    return (
      <div
        key={lead.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "10px",
          background: "#fff",
        }}
      >
        <strong>{lead.lead_name}</strong>

        <p>{lead.contact_person || "--"}</p>

        <p>{lead.phone}</p>
      </div>
    );
  }

  const columns = {
    cold: leads.filter((lead) => lead.status === "cold"),
    contacted: leads.filter((lead) => lead.status === "contacted"),
    warm: leads.filter((lead) => lead.status === "warm"),
    meeting_booked: leads.filter((lead) => lead.status === "meeting_booked"),
    proposal_sent: leads.filter((lead) => lead.status === "proposal_sent"),
    closed_won: leads.filter((lead) => lead.status === "closed_won"),
    closed_lost: leads.filter((lead) => lead.status === "closed_lost"),
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sales Pipeline</h1>
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
          ["Cold", "cold"],
          ["Contacted", "contacted"],
          ["Warm", "warm"],
          ["Meeting", "meeting_booked"],
          ["Proposal", "proposal_sent"],
          ["Won", "closed_won"],
          ["Lost", "closed_lost"],
        ].map(([title, key]) => (
          <div
            key={key}
            style={{
              minWidth: "250px",
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>
              {title} ({columns[key].length})
            </h3>

            {columns[key].map(renderLeadCard)}
          </div>
        ))}
      </div>
      </DragDropContext>
    </div>
  );
}

export default PipelinePage;
