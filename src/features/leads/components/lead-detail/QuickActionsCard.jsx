import { Button } from "@/components/ui/button";
import { Phone, Globe, Mail, MessageCircle, MapPin, Video } from "lucide-react";

export default function QuickActionsCard({
  lead, copyPhone, copyWebsite, sendEmail, sendWhatsapp, setShowMeetingForm,
}) {
  const openMaps = () => {
    if (!lead.google_maps_link) return;
    window.open(lead.google_maps_link, "_blank");
  };

  return (
    <div className="rounded-xl border border-ash bg-canvas-white p-5">
      <h2 className="mb-4 text-sm font-medium text-charcoal">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={copyPhone}>
          <Phone className="h-3.5 w-3.5" /> Copy Phone
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={sendWhatsapp}>
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={sendEmail}>
          <Mail className="h-3.5 w-3.5" /> Email
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={copyWebsite}>
          <Globe className="h-3.5 w-3.5" /> Copy Website
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={openMaps}>
          <MapPin className="h-3.5 w-3.5" /> Maps
        </Button>
        <Button size="sm" className="justify-start gap-2" onClick={() => setShowMeetingForm(true)}>
          <Video className="h-3.5 w-3.5" /> Book Meeting
        </Button>
      </div>
    </div>
  );
}
