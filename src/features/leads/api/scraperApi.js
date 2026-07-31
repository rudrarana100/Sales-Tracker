import { createLead } from "./leadsApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Start high-volume scraping job
export async function startScraperJob({ query, location, targetCount = 50 }) {
  const response = await fetch(`${BACKEND_URL}/api/scrape-maps/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, location, targetCount }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to start scraping job.");
  }

  return result.jobId;
}

// Check job status & live progress
export async function checkScraperStatus(jobId) {
  const response = await fetch(`${BACKEND_URL}/api/scrape-maps/status/${jobId}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch scraper status.");
  }

  return result;
}

// Import selected leads to CRM

export async function importScrapedLeads(selectedLeads, collectionName = "Scraped Leads") {
  let importedCount = 0;
  let skippedCount = 0;

  for (const lead of selectedLeads) {
    try {
      await createLead({
        lead_name: lead.lead_name || "Unknown Business",
        contact_person: lead.contact_person || "--",
        phone: lead.phone || null,
        email: lead.email || null,
        website: lead.website || null,
        business_type: lead.business_type || "General",
        google_maps_link: lead.google_maps_link || null,
        import_batch: collectionName, // Always uses the exact folder name given in modal
        status: "cold",
        last_outcome: "scraped_from_maps",
      });
      importedCount++;
    } catch (error) {
      if (error?.status === 409 || error?.message?.includes("409") || error?.code === "23505") {
        skippedCount++;
      }
    }
  }

  return { importedCount, skippedCount };
}