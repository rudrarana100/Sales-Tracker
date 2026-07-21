import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon, accent }) {
  return (
    <Card className="card-hairline card-hairline-hover">
      <CardContent className="flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {value}
          </h2>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent || 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
