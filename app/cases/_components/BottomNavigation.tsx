"use client";

import { Home, Search, Settings, Grid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "../_context/CasesContext";

export function BottomNavigation() {
  const { activeTab, setActiveTab } = useCases();

  const navItems = [
    { icon: Grid, label: "メニュー", href: "/", type: "link" },
    { icon: Home, label: "一覧", id: "list", type: "tab" },
    { icon: Search, label: "検索", id: "search", type: "tab" },
    { icon: Settings, label: "ツール", id: "tools", type: "tab" },
  ] as const;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="glass dark:glass-dark rounded-[32px] p-2 flex items-center justify-around shadow-2xl shadow-black/10 border border-white/20 dark:border-white/10">
        {navItems.map((item) => {
          const isActive = item.type === "tab" ? activeTab === item.id : false;
          
          if (item.type === "link") {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center py-2 px-4 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-black tracking-tight">{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-black tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
