import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { currentUserRole } = useWorkspace();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUserRole)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Your current role (<span className="font-semibold capitalize text-foreground">{currentUserRole}</span>) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return children;
}
