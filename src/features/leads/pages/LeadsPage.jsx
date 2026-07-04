import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import LeadForm from "../components/LeadForm";
import LeadsList from "../components/LeadsList";

function LeadsPage() {
  const [leads, setLeads] = useState([]);

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div>
      <h1>Sales Tracker</h1>

      <LeadForm onLeadAdded={fetchLeads} />

      <LeadsList leads={leads} />
    </div>
  );
}

export default LeadsPage;