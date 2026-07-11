import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import Dashboard from "../components/Dashboard";
import CsvImport from "../components/CsvImport";
import { useNavigate } from "react-router-dom";

function LeadsPage() {
  const [leads, setLeads] = useState([]);

  const navigate = useNavigate();

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
      <Dashboard
        leads={leads}
        onStartCalling={() => navigate("/call-session")}
      />

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={() => navigate("/leads")}
          style={{ marginRight: "10px" }}
        >
          View All Leads
        </button>

        <button onClick={() => navigate("/call-session")}>
          Start Calling
        </button>
      </div>

      <CsvImport onImport={fetchLeads} />
    </div>
  );
}

export default LeadsPage;