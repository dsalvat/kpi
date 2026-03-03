import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import KPIsServeis from "@/pages/KPIsServeis";
import KPIsProjectes from "@/pages/KPIsProjectes";
import OKRs from "@/pages/OKRs";
import ValorNegoci from "@/pages/ValorNegoci";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kpis-serveis" element={<KPIsServeis />} />
          <Route path="/kpis-projectes" element={<KPIsProjectes />} />
          <Route path="/okrs" element={<OKRs />} />
          <Route path="/valor-negoci" element={<ValorNegoci />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
