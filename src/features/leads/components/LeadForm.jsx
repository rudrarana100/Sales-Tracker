import { useRef, useState } from "react";
import { createLead } from "../api/leadsApi";

function LeadForm({ onLeadAdded }) {
  const [leadName, setLeadName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  

  const leadNameRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!leadName.trim()) {
      alert("Lead name is required.");
      return;
    }

    if (!phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    try {
      await createLead({
        lead_name: leadName,
        phone: phone,
        contact_person: contactPerson,
        business_type: businessType,
        website: website,
        email: email,
        source: "cold_call",
        status: "cold",
      });

      setLeadName("");
      setPhone("");
      setContactPerson("");
      setBusinessType("");
      setWebsite("");
      setEmail("");

      onLeadAdded();

      leadNameRef.current.focus();

      console.log("Lead Added!");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={leadNameRef}
        type="text"
        placeholder="Lead Name *"
        value={leadName}
        onChange={(e) => setLeadName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="text"
        placeholder="Contact Person"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
      />

      <input
        type="text"
        placeholder="Business Type"
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value)}
      />

      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">
        Add Lead
      </button>
    </form>
  );
}

export default LeadForm;