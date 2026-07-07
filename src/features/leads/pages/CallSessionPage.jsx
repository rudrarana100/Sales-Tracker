import { useEffect, useState } from "react";
import { getLeads, updateLead } from "../api/leadsApi";

function CallSessionPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");

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

      if (outcome === "callback_requested") {
        setShowCallbackForm(true);
        return;
      }

      const config = outcomeConfig[outcome];

      await updateLead(currentLead.id, {
        status: config.status,
        last_outcome: outcome,
        last_contact_date: new Date().toISOString().split("T")[0],
      });

      await fetchLeads();
    } catch (error) {
      console.error(error);
    }
  }

  async function saveCallback() {
    try {
      if (!callbackDate || !callbackTime) {
        alert("Please select both date and time.");
        return;
      }

      await updateLead(currentLead.id, {
        status: "contacted",
        last_outcome: "callback_requested",
        last_contact_date: new Date().toISOString().split("T")[0],
        follow_up_date: callbackDate,
        follow_up_time: callbackTime,
      });

      setShowCallbackForm(false);
      setCallbackDate("");
      setCallbackTime("");

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

      <p>Lead 1 / {coldLeads.length}</p>

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

      <button onClick={() => handleOutcome("callback_requested")}>
        📅 Callback Requested
      </button>

      <button onClick={() => handleOutcome("not_interested")}>
        🙅 Not Interested
      </button>

      <button onClick={() => handleOutcome("interested")}>
        🟢 Interested
      </button>

      {showCallbackForm && (
        <div>
          <h3>Schedule Callback</h3>

          <input
            type="date"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
          />

          <input
            type="time"
            value={callbackTime}
            onChange={(e) => setCallbackTime(e.target.value)}
          />

          <button onClick={saveCallback}>
            Save Callback
          </button>
        </div>
      )}
    </div>
  );
}

export default CallSessionPage;