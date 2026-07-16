import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon, accent }) {
  return (
    <Card className="border-ash shadow-none transition hover:border-smoke">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-fog">
            {title}
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight text-charcoal">
            {value}
          </h2>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${accent || 'bg-paper-mist text-fog'}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
