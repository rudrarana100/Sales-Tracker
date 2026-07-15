import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        />

        <Input
          placeholder="Search leads..."
          className="h-9 rounded-lg border-zinc-200 bg-zinc-50 pl-9 shadow-none focus-visible:ring-1"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-100">
          <Bell className="h-4 w-4 text-zinc-600" />
        </button>

        <Avatar className="h-9 w-9 border border-zinc-200">
          <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-700">
            RR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}