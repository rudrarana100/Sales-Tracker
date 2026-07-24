import { supabase } from "@/lib/supabase";

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getTask(id) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleTask(task) {
  return updateTask(task.id, {
    status: task.status === "completed" ? "pending" : "completed",
    completed_at:
      task.status === "completed" ? null : new Date().toISOString(),
  });
}

export async function getLeadTasks(leadId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}