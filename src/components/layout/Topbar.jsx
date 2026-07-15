import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <Input
          placeholder="Search leads..."
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-5">
        <Bell
          className="text-slate-600 cursor-pointer"
          size={20}
        />

        <Avatar>
          <AvatarFallback>RR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}