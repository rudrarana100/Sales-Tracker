import { supabase } from "../../../lib/supabase";

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", {ascending: false})

  if (error) throw error;

  return data;
}

export async function createLead(lead) {
  const { data, error } = await supabase
    .from("leads")
    .insert([lead])
    .select();

  if (error) throw error;

  return data;
}
export async function updateLead(id, updates) {
  console.log("updateLead received id:", id);

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}
export async function deleteLead(id){
  const {data, error} = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

    if (error) throw error;

    return data;
}