"use client";

import { Home, Search, Settings, Grid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { icon: Grid, label: "メニュー", href: "/" },
    { icon: Home, label: "一覧", href: "/cases" },
    { icon: Search, label: "検索", href: "/cases/search" },
    { icon: Settings, label: "ツール", href: "/cases/tools" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="glass dark:glass-dark rounded-[32px] p-2 flex items-center justify-around shadow-2xl shadow-black/10 border border-white/20 dark:border-white/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/cases" && pathname.startsWith("/cases/list"));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-black tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
