import { createLead } from "./leadsApi"; // Or whatever your function is named in leadsApi.js (e.g. addLead, insertLead)

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function scrapeGoogleMapsLeads({ query, location, limit = 10 }) {
  const response = await fetch(`${BACKEND_URL}/api/scrape-maps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, location, limit }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to fetch leads from backend scraper.");
  }

  return result.data;
}

export async function importScrapedLeads(selectedLeads) {
  // Save each scraped lead to the database
  const createPromises = selectedLeads.map((lead) => createLead(lead));
  return Promise.all(createPromises);
}