import { useState } from "react";
import { MessageSquare, Calendar, Send } from "lucide-react";
import { toast } from "sonner";

export default function LeadInteractionPanel({ lead, onUpdate }) {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState("");

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs">
        <p>Select a lead to view interactions.</p>
      </div>
    );
  }

  // Handle WhatsApp Confirmation / Message Trigger
  async function handleSendWhatsApp(customMsg) {
    const textToSend = customMsg || messageText;
    if (!textToSend.trim()) {
      toast.warning("Please enter a message to send.");
      return;
    }

    setSending("whatsapp");
    try {
      // Format phone number (ensure clean digits)
      let cleanPhone = lead.phone?.replace(/[^0-9]/g, "");
      if (!cleanPhone) {
        throw new Error("Invalid or missing phone number for this lead.");
      }

      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }

      // Trigger WhatsApp Web / App intent
      const encodedMessage = encodeURIComponent(textToSend);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");

      toast.success("WhatsApp message triggered successfully!");
      setMessageText("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to trigger WhatsApp message.");
    } finally {
      setSending("");
    }
  }

  // Quick template for Google Meet / Meeting Confirmation
  function handleSendMeetingConfirmation() {
    const defaultTemplate = `Hi ${lead.contact_person || lead.lead_name || "there"}, this is a quick confirmation for our upcoming Google Meet session. Looking forward to speaking with you!`;
    handleSendWhatsApp(defaultTemplate);
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lead.lead_name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800 uppercase">
              {lead.status || "cold"}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            {lead.phone || "No phone provided"} • {lead.email || "No email"}
          </p>
        </div>

        {/* Quick Google Meet Confirmation Trigger Button */}
        <button
          onClick={handleSendMeetingConfirmation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Send Meet WA Confirmation</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-1.5 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "whatsapp"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>WhatsApp Messaging</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        {activeTab === "whatsapp" && (
          <div className="flex flex-col h-full space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Quick Action Templates
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSendMeetingConfirmation}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  📅 Google Meet Confirmation
                </button>
                <button
                  onClick={() => handleSendWhatsApp(`Hi ${lead.contact_person || lead.lead_name || "there"}, checking in to see if you had a chance to review our proposal.`)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  💬 Follow-up Check-in
                </button>
              </div>
            </div>

            {/* Custom Message Box */}
            <div className="flex flex-col flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom WhatsApp Message
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message to send via WhatsApp..."
                className="w-full flex-1 min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSendWhatsApp()}
                disabled={sending === "whatsapp"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sending === "whatsapp" ? "Opening..." : "Send WhatsApp Message"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}