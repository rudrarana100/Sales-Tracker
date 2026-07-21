import { Globe, Mail, MapPin, Phone, User, Briefcase } from "lucide-react";

export default function ContactCard({ lead }) {
  const Item = ({ icon: Icon, label, value, link }) => (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {link && value ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-sm font-medium text-ring hover:underline">
            Open
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-foreground">{value || "--"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="premium-card p-6">
      <h2 className="mb-4 text-sm font-medium text-foreground">Contact Information</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Item icon={User} label="Contact Person" value={lead.contact_person} />
        <Item icon={Phone} label="Phone" value={lead.phone} />
        <Item icon={Mail} label="Email" value={lead.email} />
        <Item icon={Globe} label="Website" value={lead.website} link />
        <Item icon={MapPin} label="Google Maps" value={lead.google_maps_link} link />
        <Item icon={Briefcase} label="Business Type" value={lead.business_type} />
      </div>
    </div>
  );
}
