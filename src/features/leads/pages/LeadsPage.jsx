import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";
import Dashboard from "../components/Dashboard";
import CsvImport from "../components/CsvImport";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Phone } from "lucide-react";

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
    <div className="space-y-5">
      <Dashboard
        leads={leads}
        onStartCalling={() => navigate("/call-session")}
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
          <Eye className="h-3.5 w-3.5" />
          View All Leads
        </Button>
        <Button size="sm" onClick={() => navigate("/call-session")}>
          <Phone className="h-3.5 w-3.5" />
          Start Calling
        </Button>
      </div>

      <CsvImport onImport={fetchLeads} />
    </div>
  );
}

export default LeadsPage;
