import { CalendarDays, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store";

export function Header() {
  const { selectedYear, setSelectedYear } = useAppStore();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm">
      {/* Left — context breadcrumb placeholder */}
      <div />

      {/* Right — year selector */}
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-text-tertiary" strokeWidth={1.8} />
        <div className="relative">
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none rounded-lg border border-border bg-white py-1.5 pl-3 pr-8 font-mono text-sm font-medium text-text-primary transition-colors hover:border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            aria-label="Seleccionar any"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
        </div>
      </div>
    </header>
  );
}
