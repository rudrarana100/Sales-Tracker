import { Routes, Route } from "react-router-dom";
import CallSessionPage from "./features/leads/pages/CallSessionPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import AllLeadsPage from "./features/leads/pages/AllLeadsPage";
import LeadDetailPage from "./features/leads/pages/LeadDetailPage";
import FollowUpsPage from "./features/leads/pages/FollowUpsPage";
import PipelinePage from "./features/leads/pages/PipelinePage";
import FollowUpQueue from "./features/leads/pages/FollowUpQueue";
import AppLayout from "./components/layout/AppLayout";
import SettingsPage from "./features/leads/pages/SettingsPage";
import LoginPage from "./features/leads/pages/LoginPage";
import TasksPage from "./features/leads/pages/TasksPage";
import CalendarPage from "./features/leads/pages/CalendarPage";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<LeadsPage />} />
                      <Route path="/call-session" element={<CallSessionPage />} />
                      <Route path="/leads" element={<AllLeadsPage />} />
                      <Route path="/leads/:id" element={<LeadDetailPage />} />
                      <Route path="/follow-ups" element={<FollowUpsPage />} />
                      <Route path="/pipeline" element={<PipelinePage />} />
                      <Route path="/followups/queue" element={<FollowUpQueue />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

