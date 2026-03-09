import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  FolderKanban,
  Target,
  TrendingUp,
  PanelLeftClose,
  PanelLeft,
  BarChart3,
  Database,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Monitoritzacio",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/kpis-serveis", label: "KPIs Serveis", icon: Monitor },
      { path: "/kpis-projectes", label: "KPIs Projectes", icon: FolderKanban },
      { path: "/okrs", label: "OKRs", icon: Target },
      { path: "/valor-negoci", label: "Valor Negoci", icon: TrendingUp },
    ],
  },
  {
    label: "Gestio de Dades",
    items: [
      { path: "/entrada-dades", label: "Entrada de Dades", icon: Database },
      { path: "/master-dades", label: "Master de Dades", icon: Settings2 },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-nav flex h-full flex-col gradient-sidebar border-r border-white/[0.06] text-white transition-all duration-200 ease-out",
        sidebarOpen ? "w-60" : "w-[68px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
          <BarChart3 className="h-4 w-4 text-secondary" strokeWidth={2} />
        </div>
        {sidebarOpen && (
          <p className="truncate font-display text-[15px] font-semibold tracking-tight">
            IT Command Center
          </p>
        )}
      </div>

      {/* Nav groups */}
      <nav className="mt-2 flex-1 overflow-y-auto px-3" aria-label="Navegacio principal">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {sidebarOpen && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                          : "text-white/50 hover:bg-white/[0.06] hover:text-white/80",
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          aria-label={sidebarOpen ? "Replegar sidebar" : "Expandir sidebar"}
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span>Replegar</span>
            </>
          ) : (
            <PanelLeft className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          )}
        </button>
        {sidebarOpen && (
          <p className="mt-2 px-3 text-[10px] font-medium uppercase tracking-wider text-white/20">
            Dept. Sistemes IT
          </p>
        )}
      </div>
    </aside>
  );
}
