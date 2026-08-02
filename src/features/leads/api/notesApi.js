import { supabase } from "../../../lib/supabase";

export async function addNote(notePayload) {
  const { data, error } = await supabase
    .from("notes")
    .insert([notePayload])
    .select();

  if (error) throw error;
  return data;
}

export async function getNotes(leadId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteNote(noteId) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) throw error;
}