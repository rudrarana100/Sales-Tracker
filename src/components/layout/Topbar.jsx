import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function handleSearch(e) {
    if (e.key === "Enter") {
      const query = search.trim();

      if (!query) return;

      navigate(`/leads?search=${encodeURIComponent(query)}`);
      setSearch("");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search leads..."
          className="h-9 rounded-xl border border-border bg-muted/50 pl-9 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <Avatar className="ml-1 h-8 w-8">
          <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
            RR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
