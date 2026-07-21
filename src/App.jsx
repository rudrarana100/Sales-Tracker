import CallSessionPage from "./features/leads/pages/CallSessionPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import AllLeadsPage from "./features/leads/pages/AllLeadsPage";
import LeadDetailPage from "./features/leads/pages/LeadDetailPage";
import FollowUpsPage from "./features/leads/pages/FollowUpsPage";
import { Routes, Route } from "react-router-dom";
import PipelinePage from "./features/leads/pages/PipelinePage";
import AppLayout from "./components/layout/AppLayout";
import FollowUpQueue from "./features/leads/pages/FollowUpQueue";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LeadsPage />} />
        <Route path="/call-session" element={<CallSessionPage />} />
        <Route path="/leads" element={<AllLeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/followups/queue" element={<FollowUpQueue />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
