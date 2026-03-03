import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-200 ease-out",
          sidebarOpen ? "ml-60" : "ml-[68px]",
        )}
      >
        <Header />
        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
