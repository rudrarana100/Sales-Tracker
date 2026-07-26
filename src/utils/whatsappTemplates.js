export const WHATSAPP_TEMPLATES = [
  {
    id: "intro-pitch",
    title: "Intro and Value Proposition",
    category: "Cold Outreach",
    text: "Hi {name},\n\nGreat speaking with you today. As discussed, we help businesses like {company} build modern websites that increase trust and generate more inbound leads.\n\nWould love to show you a few examples on a quick call whenever you are free.",
  },
  {
    id: "no-answer",
    title: "Missed Call / Follow-up",
    category: "Follow-up",
    text: "Hi {name},\n\nTried reaching out earlier today regarding {company}, but missed you. Let me know when is a good time for a brief chat this week.",
  },
  {
    id: "proposal-followup",
    title: "Proposal Follow-up",
    category: "Deals",
    text: "Hi {name},\n\nFollowing up on the proposal sent over for {company}. Let me know if you had any questions or if you would like to review the details together.",
  },
];

export function formatTemplate(templateText, lead, extraParams = {}) {
  if (!templateText || !lead) return "";
  return templateText
    .replace(/{name}/g, lead.contact_person || lead.lead_name || "there")
    .replace(/{company}/g, lead.lead_name || "your company");
}