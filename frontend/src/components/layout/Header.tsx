import { CalendarDays, ChevronDown, Search, Bell, User } from "lucide-react";
import { useAppStore } from "@/store";

export function Header() {
  const { selectedYear, setSelectedYear } = useAppStore();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm">
      {/* Left — search */}
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.8} />
        <input
          type="text"
          placeholder="Cercar..."
          className="w-full rounded-lg border border-border bg-overlay-muted py-1.5 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-tertiary transition-colors hover:border-overlay-border-hover focus:border-secondary/40 focus:outline-none focus:ring-1 focus:ring-secondary/20"
          aria-label="Cercar"
        />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-overlay-hover hover:text-text-secondary"
          aria-label="Notificacions"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-text-tertiary" strokeWidth={1.8} />
          <div className="relative">
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none rounded-lg border border-border bg-overlay-muted py-1.5 pl-3 pr-8 font-mono text-sm font-medium text-text-primary transition-colors hover:border-overlay-border-hover focus:border-secondary/40 focus:outline-none focus:ring-1 focus:ring-secondary/20"
              aria-label="Seleccionar any"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-option-bg text-text-primary">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          </div>
        </div>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary">
          <User className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
