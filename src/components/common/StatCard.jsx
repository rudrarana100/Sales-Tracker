import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon, accent, delta }) {
  return (
    <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h2>
            {delta && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{delta}</span>}
          </div>
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}


