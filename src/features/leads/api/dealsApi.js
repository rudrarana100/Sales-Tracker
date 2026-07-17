import { supabase } from "../../../lib/supabase";

export async function createDeal(deal) {
  const { data, error } = await supabase
    .from("deals")
    .insert([deal])
    .select();

  if (error) throw error;

  return data;
}

export async function getDeals() {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      leads(
        id,
        lead_name,
        phone,
        contact_person
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function updateDeal(id, updates) {
  const { data, error } = await supabase
    .from("deals")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

export async function deleteDeal(id) {
  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
export async function getDealByLeadId(leadId) {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) throw error;

  return data;
}