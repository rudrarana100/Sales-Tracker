import { supabase } from "../../../lib/supabase";

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*");

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