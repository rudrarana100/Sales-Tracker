import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import LoadingState from "@/components/common/LoadingState";
import { useTheme } from "@/hooks/useTheme";
import { getSettings, saveSettings } from "../api/settingsApi";
import { supabase } from "@/lib/supabase";
import {
  User,
  Moon,
  Sun,
  Phone,
  CheckCircle2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const INITIAL_SETTINGS = {
  user_name: "",
  company_name: "",
  email: "",
  phone: "",
  country_code: "91",
  meet_duration: "30",
  follow_up_delay: "1",
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUserDataAndSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let authEmail = "";
        let authName = "";
        let authCompany = "";
        let authPhone = "";

        if (user) {
          authEmail = user.email || "";
          // LoginPage ke register function ke mutabiq metadata se data extract kiya
          authName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          authCompany = user.user_metadata?.company_name || "";
          authPhone = user.user_metadata?.phone || "";
        }

        let dbSettings = {};
        try {
          dbSettings = await getSettings() || {};
        } catch (err) {
          console.warn("Could not fetch custom settings from DB.");
        }

        setSettings((prev) => ({
          ...prev,
          ...dbSettings,
          email: dbSettings.email || authEmail,
          user_name: dbSettings.user_name || authName,
          company_name: dbSettings.company_name || authCompany,
          phone: dbSettings.phone || authPhone,
        }));

      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserDataAndSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await saveSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading settings..." type="card" />;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <PageHeader
        title="Settings"
        description="Manage your profile, calling preferences, integrations, and theme."
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Settings */}
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> Account Profile
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={settings.user_name || ""}
                onChange={(e) => handleChange("user_name", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Enter company name"
                value={settings.company_name || ""}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={settings.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={settings.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </SectionCard>

        {/* Calling & Meeting Preferences */}
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-500" /> Calling & Meeting Defaults
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                WhatsApp Country Code
              </label>
              <input
                type="text"
                value={settings.country_code || "91"}
                onChange={(e) => handleChange("country_code", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Default Meet Duration
              </label>
              <select
                value={settings.meet_duration || "30"}
                onChange={(e) => handleChange("meet_duration", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                No Answer Follow-up
              </label>
              <select
                value={settings.follow_up_delay || "1"}
                onChange={(e) => handleChange("follow_up_delay", e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="1">Next Day (+1 Day)</option>
                <option value="2">In 2 Days (+2 Days)</option>
                <option value="3">In 3 Days (+3 Days)</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Theme & Appearance */}
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" /> Appearance & Theme
            </span>
          }
        >
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Interface Theme Mode
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Switch between dark slate navy and crisp light mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </SectionCard>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {saving ? (
              <CheckCircle2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}