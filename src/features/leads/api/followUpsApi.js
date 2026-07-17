import { supabase } from "../../../lib/supabase";

// Get all follow-ups
export async function getFollowUps() {
  const { data, error } = await supabase
    .from("follow_ups")
    .select(
      `
  *,
  leads (
    id,
    lead_name,
    phone,
    contact_person,
    status,
    website,
    google_maps_link
  )
`,
    )
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) throw error;

  return data;
}

// Today's follow-ups
export async function getTodayFollowUps() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("follow_ups")
    .select(
      `
  *,
  leads (
    id,
    lead_name,
    phone,
    contact_person,
    status,
    website,
    google_maps_link
  )
`,
    )
    .eq("scheduled_date", today)
    .eq("status", "pending")
    .order("scheduled_time", { ascending: true });

  if (error) throw error;

  return data;
}

// Overdue follow-ups
export async function getOverdueFollowUps() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("follow_ups")
    .select(
      `
  *,
  leads (
    id,
    lead_name,
    phone,
    contact_person,
    status,
    website,
    google_maps_link
  )
`,
    )
    .lt("scheduled_date", today)
    .eq("status", "pending")
    .order("scheduled_date", { ascending: true });

  if (error) throw error;

  return data;
}

// Create follow-up
export async function createFollowUp(followUp) {
  const { data, error } = await supabase
    .from("follow_ups")
    .insert([followUp])
    .select();

  if (error) throw error;

  return data;
}

// Update follow-up
export async function updateFollowUp(id, updates) {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

// Mark follow-up completed
export async function completeFollowUp(id) {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

// Delete follow-up
export async function deleteFollowUp(id) {
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);

  if (error) throw error;
}

// Get follow-ups for a specific lead
export async function getLeadFollowUps(leadId) {
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("lead_id", leadId)
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });

  if (error) throw error;

  return data;
}
export async function skipFollowUp(id) {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({
      status: "skipped",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}