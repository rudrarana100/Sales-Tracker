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
    <div className="rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={copyPhone}
        >
          <Phone className="h-4 w-4" />
          Copy Phone
        </Button>

        <Button
          variant="outline"
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={sendWhatsapp}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>

        <Button
          variant="outline"
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={sendEmail}
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>

        <Button
          variant="outline"
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={copyWebsite}
        >
          <Globe className="h-4 w-4" />
          Copy Website
        </Button>

        <Button
          variant="outline"
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={openMaps}
        >
          <MapPin className="h-4 w-4" />
          Google Maps
        </Button>

        <Button
          className="h-12 justify-start gap-3 rounded-xl"
          onClick={() => setShowMeetingForm(true)}
        >
          <Video className="h-4 w-4" />
          Book Meeting
        </Button>
      </div>
    </div>
  );
}