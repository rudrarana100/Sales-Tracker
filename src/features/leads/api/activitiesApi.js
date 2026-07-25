import { supabase } from "../../../lib/supabase";

export async function addActivity(activity) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("activities")
    .insert([{ ...activity, user_id: user.id }])
    .select();

  if (error) throw error;

  return data;
}

export async function getActivities(leadId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", leadId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getRecentActivities() {
  // 1. Get current logged in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. Filter query explicitly by user.id
  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      leads (
        lead_name
      )
    `)
    .eq("user_id", user.id) // 👈 THIS IS WHAT WAS MISSING!
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data || [];
}