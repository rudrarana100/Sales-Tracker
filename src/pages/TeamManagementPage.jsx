import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TeamManagementPage() {
  const { currentWorkspace, currentUserRole, inviteMember, updateMemberRole, removeMember } = useWorkspace();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("rep");

  function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMember(inviteEmail.trim(), inviteRole);
    toast.success(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail("");
    setShowInviteModal(false);
  }

  const roleBadges = {
    admin: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/50",
    manager: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/50",
    rep: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60 dark:border-slate-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Permissions"
        description={`Manage team members and permissions for ${currentWorkspace.name}.`}
        action={
          currentUserRole === "admin" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Team Member</span>
            </button>
          )
        }
      />

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Admin</p>
          <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">Full Workspace Control</p>
          <p className="text-[11px] text-slate-400">Can manage workspace settings, invite/remove members, and assign roles.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Manager</p>
          <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">Pipeline & Sales Overseer</p>
          <p className="text-[11px] text-slate-400">Can view all team deals, assign tasks, and monitor sales performance.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sales Rep</p>
          <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">Outbound Execution</p>
          <p className="text-[11px] text-slate-400">Executes cold call sessions, manages assigned leads, and schedules follow-ups.</p>
        </div>
      </div>

      {/* Team Members List */}
      <SectionCard title={<span className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /> Members ({currentWorkspace.members?.length || 0})</span>}>
        <div className="space-y-3">
          {currentWorkspace.members?.map((m) => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {m.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto sm:ml-0">
                {currentUserRole === "admin" && m.role !== "admin" ? (
                  <select
                    value={m.role}
                    onChange={(e) => updateMemberRole(m.id, e.target.value)}
                    className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="rep">Sales Rep</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${roleBadges[m.role] || roleBadges.rep}`}>
                    {m.role}
                  </span>
                )}

                {currentUserRole === "admin" && m.role !== "admin" && (
                  <button
                    onClick={() => {
                      removeMember(m.id);
                      toast.success("Member removed");
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="rep">Sales Rep</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 text-white dark:bg-blue-600 px-4 py-2 text-xs font-bold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
