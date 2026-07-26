import Papa from "papaparse";

export function exportLeadsToCsv(leads, filename = "sales_tracker_leads.csv") {
  if (!leads || leads.length === 0) return;

  // Clean and map keys for export
  const dataToExport = leads.map((lead) => ({
    "Business Name": lead.lead_name || "",
    "Contact Person": lead.contact_person || "",
    "Phone": lead.phone || "",
    "Email": lead.email || "",
    "Business Type": lead.business_type || "",
    "Status": lead.status || "",
    "Last Outcome": lead.last_outcome || "",
    "Last Contact Date": lead.last_contact_date || "",
    "Website": lead.website || "",
  }));

  const csv = Papa.unparse(dataToExport);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}