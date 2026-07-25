import { supabase } from "@/lib/supabase";

export async function getTasks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id) // 👈 Filters tasks for the logged-in user
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getTask(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;

  return data;
}

export async function createTask(task) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      ...task,
      user_id: user.id, // 👈 Attaches current user's ID to new task
      assigned_to: user.user_metadata?.full_name || user.email,
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateTask(id, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteTask(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("lead_id", leadId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}