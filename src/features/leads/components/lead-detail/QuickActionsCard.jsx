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
    <div className="premium-card p-6">
      <h2 className="mb-4 text-sm font-medium text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={copyPhone}>
          <Phone className="h-4 w-4" /> Copy Phone
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={sendWhatsapp}>
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={sendEmail}>
          <Mail className="h-4 w-4" /> Email
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={copyWebsite}>
          <Globe className="h-4 w-4" /> Copy Website
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={openMaps}>
          <MapPin className="h-4 w-4" /> Maps
        </Button>
        <Button size="sm" className="justify-start gap-2" onClick={() => setShowMeetingForm(true)}>
          <Video className="h-4 w-4" /> Book Meeting
        </Button>
      </div>
    </div>
  );
}
