import { Button } from "@/components/ui/button";
import {
  Phone,
  Globe,
  Mail,
  MessageCircle,
  MapPin,
  Video,
} from "lucide-react";

export default function QuickActionsCard({
  lead,
  copyPhone,
  copyWebsite,
  sendEmail,
  sendWhatsapp,
  setShowMeetingForm,
}) {
  const openMaps = () => {
    if (!lead.google_maps_link) return;
    window.open(lead.google_maps_link, "_blank");
  };

  const openWebsite = () => {
    if (!lead.website) return;

    let url = lead.website;

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <Button
          variant="outline"
          className="h-14 justify-start gap-3"
          onClick={copyPhone}
        >
          <Phone size={18} />
          Copy Phone
        </Button>

        <Button
          variant="outline"
          className="h-14 justify-start gap-3"
          onClick={sendWhatsapp}
        >
          <MessageCircle size={18} />
          WhatsApp
        </Button>

        <Button
          variant="outline"
          className="h-14 justify-start gap-3"
          onClick={sendEmail}
        >
          <Mail size={18} />
          Email
        </Button>

        <Button
          variant="outline"
          className="h-14 justify-start gap-3"
          onClick={copyWebsite}
        >
          <Globe size={18} />
          Copy Website
        </Button>

        <Button
          variant="outline"
          className="h-14 justify-start gap-3"
          onClick={openMaps}
        >
          <MapPin size={18} />
          Google Maps
        </Button>

        <Button
          className="h-14 justify-start gap-3"
          onClick={() => setShowMeetingForm(true)}
        >
          <Video size={18} />
          Book Meeting
        </Button>

      </div>
    </div>
  );
}