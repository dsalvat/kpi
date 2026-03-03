import { useAppStore } from "@/store";
import { FolderKanban } from "lucide-react";

export default function KPIsProjectes() {
  const year = useAppStore((s) => s.selectedYear);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"KPIs Projectes "}
          <span className="text-data text-lg font-medium text-text-tertiary">{year}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Seguiment de la cartera de projectes IT
        </p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <FolderKanban className="h-7 w-7 text-text-tertiary" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-text-secondary">
          En construccio
        </p>
        <p className="mt-1 max-w-sm text-[13px] text-text-tertiary">
          Aquesta pagina mostrara KPIs de projectes, distribucio per estat i ROI per projecte. Disponible a la propera iteracio.
        </p>
      </div>
    </div>
  );
}
