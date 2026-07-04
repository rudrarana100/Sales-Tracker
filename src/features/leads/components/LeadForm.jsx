import { useState } from "react";
import { createLead } from "../api/leadsApi";

function LeadForm({onLeadAdded}) {
  const [leadName, setLeadName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createLead({
        lead_name: leadName,
      });

      setLeadName("");
      onLeadAdded();

      console.log("Lead Added!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Lead Name"
        value={leadName}
        onChange={(e) => setLeadName(e.target.value)}
      />

      <button type="submit">
        Add Lead
      </button>
    </form>
  );
}

export default LeadForm;