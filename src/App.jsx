import CallSessionPage from "./features/leads/pages/CallSessionPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import AllLeadsPage from "./features/leads/pages/AllLeadsPage";
import LeadDetailPage from "./features/leads/pages/LeadDetailPage";
import FollowUpsPage from "./features/leads/pages/FollowUpsPage";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { testBackend } from "./features/leads/api/backendApi";
import PipelinePage from "./features/leads/pages/PipelinePage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  useEffect(() => {
    async function checkBackend() {
      const data = await testBackend();
      console.log(data);
    }

    checkBackend();
  }, []);
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LeadsPage />} />
        <Route path="/call-session" element={<CallSessionPage />} />
        <Route path="/leads" element={<AllLeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
