"use client";

import { useState, useMemo } from "react";
import { ClientId, Status } from "./_types/schema";
import { ClientTabs } from "./_components/ClientTabs";
import { StatusToggle } from "./_components/StatusToggle";
import { CaseCard } from "./_components/CaseCard";
import { Loader2 } from "lucide-react";
import { useCases } from "./_context/CasesContext";
import { BottomNavigation } from "./_components/BottomNavigation";

type SymbolFilter = "all" | "ball" | "circle" | "speaker";

export default function CasesHomePage() {
  const { 
    allCases, loading, error, 
    activeClient, setActiveClient,
    statusFilter, setStatusFilter,
    symbolFilter, setSymbolFilter
  } = useCases();

  const items = allCases[activeClient] || [];
  
  const filteredItems = useMemo(() => {
    let list = items.filter(item => item.status === statusFilter);
    
    if (activeClient === "priority" && symbolFilter !== "all") {
      if (symbolFilter === "ball") {
        list = list.filter(item => item.title.includes("🥎"));
      } else if (symbolFilter === "circle") {
        list = list.filter(item => item.title.includes("⭕️"));
      } else if (symbolFilter === "speaker") {
        const syms = ["📣", "📢"];
        list = list.filter(item => syms.some(s => item.title.includes(s)));
      }
    }
    return list;
  }, [items, statusFilter, activeClient, symbolFilter]);

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Header Sticky Area */}
      <div className="sticky top-0 z-20 glass border-b border-black/5 shadow-sm">
        <ClientTabs activeClient={activeClient} onChange={(id) => { setActiveClient(id); setSymbolFilter("ball"); }} />
        
        <div className="px-4 pt-4 pb-2 space-y-3">
          <StatusToggle status={statusFilter} onChange={setStatusFilter} />
          
          {/* Symbol Filter (Only for Priority Tab) */}
          {activeClient === "priority" && (
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-full">
              <button onClick={() => setSymbolFilter("all")} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${symbolFilter === "all" ? "bg-white dark:bg-[#1e293b] shadow-sm text-primary" : "text-slate-400"}`}>
                すべて
              </button>
              <button onClick={() => setSymbolFilter("ball")} className={`flex-1 py-1.5 rounded-xl text-sm transition-all ${symbolFilter === "ball" ? "bg-white dark:bg-[#1e293b] shadow-sm" : "grayscale opacity-50"}`}>
                🥎
              </button>
              <button onClick={() => setSymbolFilter("circle")} className={`flex-1 py-1.5 rounded-xl text-sm transition-all ${symbolFilter === "circle" ? "bg-white dark:bg-[#1e293b] shadow-sm" : "grayscale opacity-50"}`}>
                ⭕️
              </button>
              <button onClick={() => setSymbolFilter("speaker")} className={`flex-1 py-1.5 rounded-xl text-sm transition-all ${symbolFilter === "speaker" ? "bg-white dark:bg-[#1e293b] shadow-sm" : "grayscale opacity-50"}`}>
                📣/📢
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-primary">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-black opacity-30 uppercase tracking-widest">LOADING DATA...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center glass rounded-3xl border border-red-100 bg-red-50/30">
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <p className="text-sm font-black uppercase tracking-widest">該当する案件はありません</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredItems.map(item => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
