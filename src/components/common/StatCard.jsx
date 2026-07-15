import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <Card className="border-zinc-200 shadow-none hover:border-zinc-300 transition-all duration-200">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {value}
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}