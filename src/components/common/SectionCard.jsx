import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionCard({ title, children, action }) {
  return (
    <Card className="border-ash shadow-none">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-ash px-4 py-3">
          <CardTitle className="text-sm font-medium text-charcoal">
            {title}
          </CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
