import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-ash bg-canvas-white px-5">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
        <Input
          placeholder="Search leads..."
          className="h-7 rounded-sm border-ash bg-paper-mist pl-8 text-xs shadow-none focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-7 w-7 items-center justify-center rounded-md border border-ash text-fog transition hover:bg-paper-mist hover:text-charcoal">
          <Bell className="h-3.5 w-3.5" />
        </button>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-paper-mist text-[11px] font-medium text-charcoal">
            RR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
