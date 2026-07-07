import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const coldLeads = leads.filter(
    (lead) => lead.status === "cold"
  );

  const currentLead = coldLeads[currentIndex];

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (coldLeads.length === 0) {
    return (
      <div>
        <h1>No Cold Leads 🎉</h1>
        <p>You're all caught up.</p>
      </div>
    );
  }

  if (currentIndex >= coldLeads.length) {
    return (
      <div>
        <h1>🎉 Session Complete</h1>
        <p>You finished all cold calls.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Cold Call Session</h1>

      <p>
        Lead {currentIndex + 1} / {coldLeads.length}
      </p>

      <h2>{currentLead?.lead_name}</h2>
      <p>{currentLead?.contact_person || "No Contact Person"}</p>
      <p>{currentLead?.phone || "No Phone Number"}</p>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        📵 No Answer
      </button>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        🚫 Invalid Number
      </button>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        👤 Gatekeeper
      </button>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        📅 Callback Requested
      </button>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        🙅 Not Interested
      </button>

      <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
        🟢 Interested
      </button>
    </div>
  );
}

export default CallSessionPage;