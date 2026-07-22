import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({ title, children, action, className = "" }) {
  return (
    <Card className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.03)] ${className}`}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-5 py-3.5">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

