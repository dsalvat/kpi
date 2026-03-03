import { useAppStore } from "@/store";
import { TrendingUp } from "lucide-react";

export default function ValorNegoci() {
  const year = useAppStore((s) => s.selectedYear);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"Valor al Negoci "}
          <span className="text-data text-lg font-medium text-text-tertiary">{year}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Blue Money, Green Money i ROI del Departament IT
        </p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-money-light">
          <TrendingUp className="h-7 w-7 text-blue-money" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-text-secondary">
          En construccio
        </p>
        <p className="mt-1 max-w-sm text-[13px] text-text-tertiary">
          Aquesta pagina detallara Blue Money (eficiencia), Green Money (valor negoci), calcul de ROI global i comparatives per projecte. Disponible a la Fase 3.
        </p>
      </div>
    </div>
  );
}
