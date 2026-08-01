import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { getLeads } from "../api/leadsApi";
import { getFollowUps } from "../api/followUpsApi";
import Dashboard from "../components/Dashboard";
import { useNavigate } from "react-router-dom";

// Lazy loaded CsvImport component
const CsvImport = lazy(() => import("../components/CsvImport"));

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const csvImportRef = useRef(null);

  async function fetchDashboardData() {
    try {
      // Parallel execution for fast dashboard initialization
      const [leadsData, followUpsData] = await Promise.all([
        getLeads().catch(() => []),
        getFollowUps().catch(() => []),
      ]);

      setLeads(leadsData || []);
      setFollowUps((followUpsData || []).filter((f) => f.status === "pending"));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <Dashboard
        leads={leads}
        followUps={followUps}
        onStartCalling={() => navigate("/call-session")}
        onImportClick={() => csvImportRef.current?.openFilePicker()}
      />

      <Suspense fallback={null}>
        <CsvImport
          ref={csvImportRef}
          onImport={fetchDashboardData}
        />
      </Suspense>
    </div>
  );
}

export default LeadsPage;