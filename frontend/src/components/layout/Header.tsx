import { CalendarDays, ChevronDown, Search, Bell, User } from "lucide-react";
import { useAppStore } from "@/store";

export function Header() {
  const { selectedYear, setSelectedYear } = useAppStore();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      {/* Left — search */}
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.8} />
        <input
          type="text"
          placeholder="Cercar..."
          className="w-full rounded-xl border border-border bg-bg py-2 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-tertiary transition-colors hover:border-text-tertiary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/15"
          aria-label="Cercar"
        />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Year selector */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-1.5">
          <CalendarDays className="h-4 w-4 text-text-tertiary" strokeWidth={1.8} />
          <div className="relative">
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-transparent pr-5 text-[13px] font-semibold text-text-primary focus:outline-none"
              aria-label="Seleccionar any"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-option-bg text-text-primary">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg text-text-secondary transition-colors hover:bg-overlay-hover hover:text-text-primary"
          aria-label="Notificacions"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-white">
          <User className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
