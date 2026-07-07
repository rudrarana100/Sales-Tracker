import CallSessionPage from "./features/leads/pages/CallSessionPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadsPage />} />
      <Route path="/call-session" element={<CallSessionPage />} />
    </Routes>
  );
}

export default App;