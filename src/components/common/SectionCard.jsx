import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({
  title,
  children,
  action,
}) {
  return (
    <Card className="border-zinc-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 px-5 py-4">
        <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
          {title}
        </CardTitle>

        {action}
      </CardHeader>

      <CardContent className="p-5">
        {children}
      </CardContent>
    </Card>
  );
}