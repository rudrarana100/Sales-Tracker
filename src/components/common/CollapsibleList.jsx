import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleList({
  items = [],
  renderItem,
  initialCount = 5,
  spacing = "space-y-2",
}) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const remainingCount = items.length - initialCount;

  if (items.length === 0) return null;

  return (
    <div className={spacing}>
      <div className={spacing}>{visibleItems.map(renderItem)}</div>

      {items.length > initialCount && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer mt-2"
        >
          <span>
            {expanded ? "Show Less" : `Show More (${remainingCount} more)`}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}