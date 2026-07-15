import { deleteLead } from "../api/leadsApi";
import { useNavigate } from "react-router-dom";

function LeadsList({ leads, onStatusChange }) {
  const navigate = useNavigate();

  async function handleDelete(lead) {
    try {
      if (
        !window.confirm(`Are you sure you want to delete "${lead.lead_name}"`)
      ) {
        return;
      }

      await deleteLead(lead.id);

      await onStatusChange();
    } catch (error) {
      console.error(error);
    }
  }

return (
  <div>
    {leads.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center">
        <h3 className="text-xl font-semibold">
          No Leads Found
        </h3>

        <p className="mt-2 text-zinc-500">
          Try changing your search or filter.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:shadow-sm"
          >
            {/* Left */}
            <div className="space-y-2">
              <h3
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer text-lg font-semibold transition hover:text-orange-600"
              >
                {lead.lead_name}
              </h3>

              <div className="flex gap-6 text-sm text-zinc-500">
                <span>
                  {lead.contact_person || "No Contact"}
                </span>

                <span>{lead.phone || "--"}</span>
              </div>

              <div className="flex gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize">
                  {lead.status.replace("_", " ")}
                </span>

                <span className="text-xs text-zinc-400">
                  {lead.follow_up_date || "No Follow-up"}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm transition hover:bg-zinc-100"
              >
                View
              </button>

              <button
                onClick={() => handleDelete(lead)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}

export default LeadsList;