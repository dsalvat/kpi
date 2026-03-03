import { useAppStore } from "@/store";
import { Target } from "lucide-react";

export default function OKRs() {
  const year = useAppStore((s) => s.selectedYear);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"OKRs "}
          <span className="text-data text-lg font-medium text-text-tertiary">{year}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Objectius i Key Results del Departament IT
        </p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-okr-light">
          <Target className="h-7 w-7 text-okr" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-text-secondary">
          En construccio
        </p>
        <p className="mt-1 max-w-sm text-[13px] text-text-tertiary">
          Aquesta pagina mostrara els OKRs complets amb progres automatic vinculat als KPIs, retrospectives trimestrals i grafics radials. Disponible a la Fase 3.
        </p>
      </div>
    </div>
  );
}
