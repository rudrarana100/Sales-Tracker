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

  console.log("Insert data:", data);
  console.log("Insert error:", error);

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
export async function importLeads(leads) {
  const {data, error} = await supabase
    .from("leads")
    .insert(leads)
    .select();

    if (error) throw error;

    return data;
}
export async function getExistingPhones() {
  const { data, error } = await supabase
    .from("leads")
    .select("phone");

  if (error) throw error;

  return data;
}
export async function getLeadById(id) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function leadExists(phone, email) {
  let query = supabase
    .from("leads")
    .select("phone, email");

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
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .not("follow_up_date", "is", null)
    .order("follow_up_date", { ascending: true })
    .order("follow_up_time", { ascending: true });

  if (error) throw error;

  return data;
}

