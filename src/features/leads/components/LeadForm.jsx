import { useRef, useState } from "react";
import { createLead, leadExists } from "../api/leadsApi";

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

    if (leadName.trim().length < 2) {
      alert("Lead name must be at least 2 characters.");
      return;
    }

    if (!phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (website && !/^(https?:\/\/|www\.)\S+\.\S+$/.test(website)) {
      alert("Please enter a valid website.");
      return;
    }
    const exists = await leadExists(phone);

    if (exists) {
      alert("A lead with this phone number already exists.");
      return;
    }

    try {
      await createLead({
        lead_name: leadName,
        phone: phone,
        contact_person: contactPerson.trim(),
        business_type: businessType.trim(),
        website: website.trim(),
        email: email.trim(),
        source: "cold_call",
        status: "cold",
      });

      await addActivity({
        lead_id: newLead.id,
        activity_type: "lead_created",
        description: "Lead created",
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
      if (error.code === "23505") {
        alert("A lead with this phone number already exists.");
      } else {
        console.error(error);
        alert("Something went wrong.");
      }
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
        type="tel"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setPhone(value);
        }}
        maxLength={10}
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

      <button type="submit">Add Lead</button>
    </form>
  );
}

export default LeadForm;
