import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useThemeEffect } from "@/hooks/useTheme";
import Dashboard from "@/pages/Dashboard";
import KPIsServeis from "@/pages/KPIsServeis";
import KPIsProjectes from "@/pages/KPIsProjectes";
import OKRs from "@/pages/OKRs";
import ValorNegoci from "@/pages/ValorNegoci";
import EntradaDades from "@/pages/EntradaDades";
import MasterDades from "@/pages/MasterDades";
import Settings from "@/pages/Settings";

export default function App() {
  useThemeEffect();

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kpis-serveis" element={<KPIsServeis />} />
          <Route path="/kpis-projectes" element={<KPIsProjectes />} />
          <Route path="/okrs" element={<OKRs />} />
          <Route path="/valor-negoci" element={<ValorNegoci />} />
          <Route path="/entrada-dades" element={<EntradaDades />} />
          <Route path="/master-dades" element={<MasterDades />} />
          <Route path="/configuracio" element={<Settings />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
