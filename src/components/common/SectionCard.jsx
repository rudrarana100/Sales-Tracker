import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({ title, children, action }) {
  return (
    <Card className="card-premium">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
