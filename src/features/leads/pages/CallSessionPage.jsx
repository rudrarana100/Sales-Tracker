import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
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

  const coldLeads = leads.filter((lead) => lead.status === "cold");
  const currentLead = coldLeads[0];

  const outcomeConfig = {
    interested: {
      status: "warm",
    },
    no_answer: {
      status: "cold",
    },
    invalid_number: {
      status: "closed_lost",
    },
    gatekeeper: {
      status: "cold",
    },
    not_interested: {
      status: "closed_lost",
    },
  };

  async function handleOutcome(outcome) {
    try {
      if (!currentLead) return;

      // Callback Requested will be handled separately
      if (outcome === "callback") {
        alert("Callback workflow coming next 🚀");
        return;
      }

      const config = outcomeConfig[outcome];

      await updateLead(currentLead.id, {
        status: config.status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      });

      console.log(`${currentLead.lead_name} → ${outcome}`);

      // Refresh the queue.
      // Don't increase index because the current lead
      // disappears from the cold list automatically.
      await fetchLeads();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (coldLeads.length === 0) {
    return (
      <div>
        <h1>🎉 Session Complete</h1>
        <p>No cold leads remaining.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Cold Call Session</h1>

      <p>
        Lead 1 / {coldLeads.length}
      </p>

      <h2>{currentLead.lead_name}</h2>

      <p>{currentLead.contact_person || "No Contact Person"}</p>

      <p>{currentLead.phone || "No Phone Number"}</p>

      <button onClick={() => handleOutcome("no_answer")}>
        📵 No Answer
      </button>

      <button onClick={() => handleOutcome("invalid_number")}>
        🚫 Invalid Number
      </button>

      <button onClick={() => handleOutcome("gatekeeper")}>
        👤 Gatekeeper
      </button>

      <button onClick={() => handleOutcome("callback")}>
        📅 Callback Requested
      </button>

      <button onClick={() => handleOutcome("not_interested")}>
        🙅 Not Interested
      </button>

      <button onClick={() => handleOutcome("interested")}>
        🟢 Interested
      </button>
    </div>
  );
}

export default CallSessionPage;