import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext();

const INITIAL_WORKSPACES = [
  {
    id: "ws_main",
    name: "BuiltStack Primary Workspace",
    plan: "Pro Enterprise",
    role: "admin",
    members: [
      { id: "mem_1", name: "Rudra Rana", email: "rudra@builtstack.com", role: "admin", status: "active" },
      { id: "mem_2", name: "Alex Vance", email: "alex@builtstack.com", role: "manager", status: "active" },
      { id: "mem_3", name: "Sarah Jenkins", email: "sarah@builtstack.com", role: "rep", status: "active" },
    ],
  },
  {
    id: "ws_outbound",
    name: "Outbound Sales Team",
    plan: "Growth Plan",
    role: "admin",
    members: [
      { id: "mem_1", name: "Rudra Rana", email: "rudra@builtstack.com", role: "admin", status: "active" },
    ],
  },
];

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState(() => {
    const stored = localStorage.getItem("workspaces");
    return stored ? JSON.parse(stored) : INITIAL_WORKSPACES;
  });

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(() => {
    const stored = localStorage.getItem("current_workspace_id");
    return stored || "ws_main";
  });

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem("current_workspace_id", currentWorkspaceId);
  }, [currentWorkspaceId]);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const switchWorkspace = (id) => {
    if (workspaces.some((w) => w.id === id)) {
      setCurrentWorkspaceId(id);
    }
  };

  const createWorkspace = (name) => {
    const newWs = {
      id: "ws_" + Date.now(),
      name,
      plan: "Starter Plan",
      role: "admin",
      members: [
        {
          id: user?.id || "mem_user",
          name: user?.user_metadata?.full_name || "Owner",
          email: user?.email || "owner@crm.com",
          role: "admin",
          status: "active",
        },
      ],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setCurrentWorkspaceId(newWs.id);
    return newWs;
  };

  const inviteMember = (email, role = "rep") => {
    const newMember = {
      id: "mem_" + Date.now(),
      name: email.split("@")[0].replace(/\./g, " ").toUpperCase(),
      email,
      role,
      status: "invited",
    };

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === currentWorkspaceId) {
          return {
            ...ws,
            members: [...ws.members, newMember],
          };
        }
        return ws;
      })
    );
  };

  const updateMemberRole = (memberId, newRole) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === currentWorkspaceId) {
          return {
            ...ws,
            members: ws.members.map((m) =>
              m.id === memberId ? { ...m, role: newRole } : m
            ),
          };
        }
        return ws;
      })
    );
  };

  const removeMember = (memberId) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === currentWorkspaceId) {
          return {
            ...ws,
            members: ws.members.filter((m) => m.id !== memberId),
          };
        }
        return ws;
      })
    );
  };

  // User role in current workspace
  const currentUserRole = currentWorkspace?.members?.find((m) => m.email === user?.email)?.role || "admin";

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentUserRole,
        switchWorkspace,
        createWorkspace,
        inviteMember,
        updateMemberRole,
        removeMember,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
