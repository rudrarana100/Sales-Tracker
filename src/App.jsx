import CallSessionPage from "./features/leads/pages/CallSessionPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import AllLeadsPage from "./features/leads/pages/AllLeadsPage";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { testBackend } from "./features/leads/api/backendApi";

function App() {
   useEffect(() => {
    async function checkBackend() {
      const data = await testBackend();
      console.log(data);
    }

    checkBackend();
  }, []);
  return (
    <Routes>
      <Route path="/" element={<LeadsPage />} />
      <Route path="/call-session" element={<CallSessionPage />} />
      <Route path="/leads" element={<AllLeadsPage />} />
    </Routes>
  );
}

export default App;