import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  FolderKanban,
  Target,
  TrendingUp,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/kpis-serveis", label: "KPIs Serveis", icon: Monitor },
  { path: "/kpis-projectes", label: "KPIs Projectes", icon: FolderKanban },
  { path: "/okrs", label: "OKRs", icon: Target },
  { path: "/valor-negoci", label: "Valor Negoci", icon: TrendingUp },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-nav flex h-full flex-col gradient-sidebar text-white transition-all duration-200 ease-out",
        sidebarOpen ? "w-60" : "w-[68px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 font-display text-sm font-bold">
          KP
        </div>
        {sidebarOpen && (
          <p className="truncate font-display text-[15px] font-semibold tracking-tight">
            KPI Platform
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-3 flex-1 space-y-0.5 px-3" aria-label="Navegacio principal">
        {navItems.map((item) => {
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
                    ? "bg-white/[0.12] text-white shadow-sm shadow-black/10"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/90",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
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
          <p className="mt-2 px-3 text-[11px] font-medium uppercase tracking-wider text-white/25">
            Dept. Sistemes IT
          </p>
        )}
      </div>
    </aside>
  );
}
