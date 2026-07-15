import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {value}
            </h2>
          </div>

          {icon}
        </div>
      </CardContent>
    </Card>
  );
}