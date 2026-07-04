function LeadsList({ leads }) {
  return (
    <div>
      <h2>All Leads</h2>

      {leads.map((lead) => (
        <div key={lead.id}>
          <h3>{lead.lead_name}</h3>
          <p>{lead.contact_person}</p>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;