import { supabase } from "../../../lib/supabase";

export async function addActivity(activity) {
  const { data, error } = await supabase
    .from("activities")
    .insert([activity])
    .select();

  if (error) throw error;

  return data;
}

export async function getActivities(leadId) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
export async function getRecentActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      leads (
        lead_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data;
}