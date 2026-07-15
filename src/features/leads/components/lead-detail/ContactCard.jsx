import {
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  Briefcase,
} from "lucide-react";

export default function ContactCard({ lead }) {
  const Item = ({ icon: Icon, label, value, link }) => (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-200 p-4">
      <Icon className="mt-1 h-5 w-5 text-zinc-500" />

      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        {link && value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block font-medium text-blue-600 hover:underline"
          >
            Open
          </a>
        ) : (
          <p className="mt-1 font-medium">
            {value || "--"}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Contact Information
      </h2>

      <div className="grid gap-4">
        <Item
          icon={User}
          label="Contact Person"
          value={lead.contact_person}
        />

        <Item
          icon={Phone}
          label="Phone"
          value={lead.phone}
        />

        <Item
          icon={Mail}
          label="Email"
          value={lead.email}
        />

        <Item
          icon={Globe}
          label="Website"
          value={lead.website}
          link
        />

        <Item
          icon={MapPin}
          label="Google Maps"
          value={lead.google_maps_link}
          link
        />

        <Item
          icon={Briefcase}
          label="Business Type"
          value={lead.business_type}
        />
      </div>
    </div>
  );
}