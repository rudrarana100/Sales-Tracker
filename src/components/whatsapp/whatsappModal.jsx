import { useState } from "react";
import { WHATSAPP_TEMPLATES, formatTemplate } from "@/utils/whatsappTemplates";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Copy, Send, Check } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppModal({ open, lead, onClose, extraParams = {} }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(WHATSAPP_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);

  if (!open || !lead) return null;

  const currentTemplate =
    WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    WHATSAPP_TEMPLATES[0];
  
  // Format text based on selected template and lead details
  const formattedMessage = formatTemplate(currentTemplate.text, lead, extraParams);

  function handleSendWhatsApp() {
    if (!lead.phone) {
      toast.warning("No phone number found.");
      return;
    }
    let phone = lead.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;

    // Mobile-safe navigation to ensure mobile browsers don't block the redirect
    window.location.href = waUrl;
    onClose();
  }

  function handleCopyText() {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    toast.success("Message copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            <span>Select WhatsApp Template — {lead.lead_name}</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Template Selector Grid */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">Choose a Template</label>
          <div className="grid grid-cols-2 gap-2">
            {WHATSAPP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedTemplateId === tmpl.id
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                <span>{tmpl.title}</span>
                <span className="text-[10px] font-normal text-slate-400">{tmpl.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Message Preview */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">Message Preview</label>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3.5 max-h-40 overflow-y-auto">
            <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-mono">
              {formattedMessage}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendWhatsApp}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              <span>Open WhatsApp with Template</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}