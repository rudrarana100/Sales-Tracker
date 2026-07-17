import { useEffect, useState, useRef } from "react";
import { getLeads } from "../api/leadsApi";
import { getDeals } from "../api/dealsApi";
import { getFollowUps } from "../api/followUpsApi";

import Dashboard from "../components/Dashboard";
import CsvImport from "../components/CsvImport";

import { useNavigate } from "react-router-dom";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [deals, setDeals] = useState([]);

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

  async function fetchFollowUps() {
    try {
      const data = await getFollowUps();
      setFollowUps(data.filter((f) => f.status === "pending"));
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchDeals() {
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchLeads();
    fetchFollowUps();
    fetchDeals();
  }, []);

  return (
    <div className="space-y-5">
      <Dashboard
        leads={leads}
        deals={deals}
        followUps={followUps}
        onStartCalling={() => navigate("/call-session")}
        onImportClick={() => csvImportRef.current?.openFilePicker()}
      />

      <CsvImport
        ref={csvImportRef}
        onImport={fetchLeads}
      />
    </div>
  );
}

export default LeadsPage;