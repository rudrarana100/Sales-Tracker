import { updateLead, deleteLead } from "../api/leadsApi";

function LeadsList({ leads, onStatusChange }) {
  async function handleStatusChange(id, value) {

  try {
    await updateLead(id, {
      status: value,
    });

    await onStatusChange();
  } catch (error) {
    console.error(error);
  }

}

async function handleDelete(lead){
    try {

      if (!window.confirm(`Are you sure you want to delete "${lead.lead_name}"`)) {
        return;
      }

      await deleteLead(lead.id);

      await onStatusChange();

    } catch (error) {
      console.error(error);
    }
  }
async function handleFollowUpChange(id, value){
  try {
    await updateLead(id, {
      follow_up_date: value,
    });

    await onStatusChange();
  } catch (error) {
    console.error(error);
  }
}
  return (
    <div>
      <h2>All Leads</h2>

      {leads.map((lead) => (
        <div
          key={lead.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{lead.lead_name}</h3>
          <p>{lead.contact_person || "No Contact Person"}</p>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
          >
            <option value="cold">Cold</option>
            <option value="contacted">Contacted</option>
            <option value="warm">Warm</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
          <input 
          type="date"
          value={lead.follow_up_date || ""}
          onChange={(e) => handleFollowUpChange(lead.id, e.target.value)} 
           />
          <button onClick={() => handleDelete(lead)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;
