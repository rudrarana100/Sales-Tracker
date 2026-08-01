import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingState from "./components/common/LoadingState";

// Lazy-loaded Page Components for Code-Splitting
const LoginPage = lazy(() => import("./features/leads/pages/LoginPage"));
const LeadsPage = lazy(() => import("./features/leads/pages/LeadsPage"));
const AllLeadsPage = lazy(() => import("./features/leads/pages/AllLeadsPage"));
const LeadDetailPage = lazy(() => import("./features/leads/pages/LeadDetailPage"));
const CallSessionPage = lazy(() => import("./features/leads/pages/CallSessionPage"));
const FollowUpsPage = lazy(() => import("./features/leads/pages/FollowUpsPage"));
const FollowUpQueue = lazy(() => import("./features/leads/pages/FollowUpQueue"));
const PipelinePage = lazy(() => import("./features/leads/pages/PipelinePage"));
const TasksPage = lazy(() => import("./features/leads/pages/TasksPage"));
const CalendarPage = lazy(() => import("./features/leads/pages/CalendarPage"));
const AnalyticsPage = lazy(() => import("./features/leads/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./features/leads/pages/SettingsPage"));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingState message="Loading workspace..." />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Suspense fallback={<LoadingState message="Loading page..." />}>
                      <Routes>
                        <Route path="/" element={<LeadsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
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
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;