import { supabase } from "@/lib/supabase";

export async function getSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveSettings(settingsData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      ...settingsData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSetting(key, defaultValue = 20) {
  try {
    const settings = await getSettings();
    if (!settings || settings[key] === undefined) return defaultValue;
    return parseInt(settings[key], 10);
  } catch (err) {
    console.error(err);
    return defaultValue;
  }
}

export async function setUserSetting(key, value) {
  try {
    // Fetches current settings first so we upsert with the right user row context
    const current = await getSettings() || {};
    await saveSettings({
      ...current,
      [key]: value,
    });
  } catch (err) {
    console.error("Failed to save setting:", err);
  }
}