import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({ title, children, action }) {
  return (
    <Card className="premium-card">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
            {title}
          </CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}
