"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleGuard from "./RoleGuard";

interface SidebarContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9ff_100%)]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
            <RoleGuard>{children}</RoleGuard>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
