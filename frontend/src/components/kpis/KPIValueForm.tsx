import { useState } from "react";
import { X } from "lucide-react";
import { useCreateKPIValue } from "@/hooks/useKPIs";
import type { KPIDefinition } from "@/types/kpi";

interface KPIValueFormProps {
  kpi: KPIDefinition;
  onClose: () => void;
}

export function KPIValueForm({ kpi, onClose }: KPIValueFormProps) {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const mutation = useCreateKPIValue(kpi.code);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    await mutation.mutateAsync({
      year,
      month,
      value: Number(value),
      notes: notes || undefined,
    });
    onClose();
  };

  const months = [
    "Gener", "Febrer", "Marc", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre",
  ];

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-tertiary hover:border-overlay-border-hover focus:border-secondary/40 focus:outline-none focus:ring-1 focus:ring-secondary/20";

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-backdrop backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-0 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-display text-base font-semibold text-text-primary">
              Afegir valor
            </h3>
            <p className="mt-0.5 text-data text-[12px] text-secondary">
              {kpi.code}
              <span className="ml-2 font-sans text-text-tertiary">{kpi.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-overlay-hover hover:text-text-secondary"
            aria-label="Tancar"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-[12px] font-medium text-text-secondary">
                Any
              </label>
              <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass}>
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-[12px] font-medium text-text-secondary">
                Mes
              </label>
              <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
                {months.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="value" className="block text-[12px] font-medium text-text-secondary">
              Valor ({kpi.unit})
            </label>
            <input
              id="value"
              type="number"
              step="any"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Target: ${kpi.target}`}
              className={`${inputClass} text-data`}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-[12px] font-medium text-text-secondary">
              Notes (opcional)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>

          {mutation.error && (
            <div className="rounded-lg bg-danger-light px-3 py-2 text-[13px] text-danger" role="alert">
              Error: {(mutation.error as Error).message}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || !value}
            className="rounded-lg bg-secondary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-50"
          >
            {mutation.isPending ? "Guardant..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
