import { useEffect, useState } from "react";
import { getLeads } from "../api/leadsApi";

function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

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

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sales Pipeline</h1>
    </div>
  );
}

export default PipelinePage;