import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon, accent }) {
  return (
    <Card className="card-premium-hover">
      <CardContent className="flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">{title}</p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">{value}</h2>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${accent || 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
