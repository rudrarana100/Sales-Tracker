import { useRef, useState } from "react";
import { createLead, leadExists } from "../api/leadsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LeadForm({ onLeadAdded }) {
  const [leadName, setLeadName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

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

    try {
      const { phoneExists, emailExists } = await leadExists(
        phone.trim(),
        email.trim() || null,
      );

      if (phoneExists && emailExists) {
        alert("A lead with this phone number and email already exists.");
        return;
      }

      if (phoneExists) {
        alert("Phone number already exists.");
        return;
      }

      if (emailExists) {
        alert("Email already exists.");
        return;
      }
      const newLead = await createLead({
        lead_name: leadName.trim(),
        phone: phone.trim(),
        contact_person: contactPerson.trim(),
        business_type: businessType.trim(),
        website: website.trim() || null,
        google_maps_link: googleMapsLink.trim() || null,
        email: email.trim() || null,
        source: "cold_call",
        status: "cold",
      });

      // Uncomment this after importing addActivity
      /*
    await addActivity({
      lead_id: newLead[0].id,
      activity_type: "lead_created",
      description: "Lead created",
    });
    */

      setLeadName("");
      setPhone("");
      setContactPerson("");
      setBusinessType("");
      setWebsite("");
      setGoogleMapsLink("");
      setEmail("");

      onLeadAdded();
      leadNameRef.current.focus();

      console.log("Lead Added!");
    } catch (error) {
      console.error(error);

      if (error.code === "23505") {
        alert("Duplicate lead detected.");
        return;
      }

      alert("Something went wrong.");
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-5 md:grid-cols-2"
    >
      <Input
        ref={leadNameRef}
        type="text"
        placeholder="Lead Name *"
        value={leadName}
        onChange={(e) => setLeadName(e.target.value)}
      />

      <Input
        type="tel"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setPhone(value);
        }}
        maxLength={10}
      />

      <Input
        type="text"
        placeholder="Contact Person"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Business Type"
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Google Maps Link"
        value={googleMapsLink}
        onChange={(e) => setGoogleMapsLink(e.target.value)}
      />

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="md:col-span-2"
      />

      <div className="md:col-span-2 flex justify-end pt-2">
        <Button type="submit" className="rounded-xl px-8">
          Add Lead
        </Button>
      </div>
    </form>
  );
}

export default LeadForm;
