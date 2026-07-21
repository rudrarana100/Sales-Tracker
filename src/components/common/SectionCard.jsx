import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({ title, children, action }) {
  return (
    <Card className="card-hairline">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            {title}
          </CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}
