import { supabase } from "../../../lib/supabase";

// Helper to get current logged-in user ID securely
async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized: Please log in first.");
  return user.id;
}

export async function getLeads() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLead(lead) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .insert([{ ...lead, user_id: userId }])
    .select();

  if (error) throw error;
  return data;
}

export async function updateLead(id, updates) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteLead(id) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function importLeads(leads) {
  const userId = await getCurrentUserId();
  const leadsWithUser = leads.map((lead) => ({ ...lead, user_id: userId }));
  const { data, error } = await supabase
    .from("leads")
    .insert(leadsWithUser)
    .select();

  if (error) throw error;
  return data;
}

export async function getExistingPhones() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("phone")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getLeadById(id) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function leadExists(phone, email) {
  const userId = await getCurrentUserId();
  let query = supabase
    .from("leads")
    .select("phone, email")
    .eq("user_id", userId);

  if (phone && email) {
    query = query.or(`phone.eq.${phone},email.eq.${email}`);
  } else if (phone) {
    query = query.eq("phone", phone);
  } else if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    phoneExists: data.some((lead) => lead.phone === phone),
    emailExists: email
      ? data.some((lead) => lead.email === email)
      : false,
  };
}

export async function getFollowUps() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .not("follow_up_date", "is", null)
    .order("follow_up_date", { ascending: true })
    .order("follow_up_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDealByLeadId(leadId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("lead_id", leadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createDeal(deal) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("deals")
    .insert([{ ...deal, user_id: userId }])
    .select();

  if (error) throw error;
  return data;
}

export async function deleteAllLeads() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("user_id", userId)
    .not("id", "is", null);

  if (error) throw error;
  return data;
}

export async function deleteMultipleLeads(ids) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("user_id", userId)
    .in("id", ids);

  if (error) throw error;
  return data;
}

export async function getImportBatches() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .select("import_batch")
    .eq("user_id", userId)
    .not("import_batch", "is", null);

  if (error) throw error;
  return [...new Set(data.map((lead) => lead.import_batch))];
}

export async function assignLeadsToCollection(leadIds, collectionName) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("leads")
    .update({ import_batch: collectionName })
    .eq("user_id", userId)
    .in("id", leadIds);

  if (error) {
    console.error("Error moving leads to collection:", error);
    throw error;
  }
  return data;
}