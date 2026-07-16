import { useEffect, useState, useRef } from "react";
import { getLeads } from "../api/leadsApi";
import Dashboard from "../components/Dashboard";
import CsvImport from "../components/CsvImport";
import { useNavigate } from "react-router-dom";

function LeadsPage() {
  const [leads, setLeads] = useState([]);

  const navigate = useNavigate();
  const csvImportRef = useRef(null);

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
    <div className="space-y-5">
      <Dashboard
        leads={leads}
        onStartCalling={() => navigate("/call-session")}
        onImportClick={() =>
          csvImportRef.current?.openFilePicker()
        }
      />

      <CsvImport
        ref={csvImportRef}
        onImport={fetchLeads}
      />
    </div>
  );
}

export default LeadsPage;