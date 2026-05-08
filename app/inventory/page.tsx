"use client";

import React, { useState, useEffect } from "react";
import { useInventory } from "./_context/InventoryContext";
import { MAKER_LIST, PartMaster } from "./_types/schema";
import { RefreshCw, Package, History, PlusCircle, User } from "lucide-react";

import { InventoryList } from "./_components/InventoryList";
import { UsageHistory } from "./_components/UsageHistory";
import { StockEntry } from "./_components/StockEntry";
import { PartDetails } from "./_components/PartDetails";

type MainTab = "list" | "history" | "entry";

export default function InventoryPage() {
  const { refreshing, refresh } = useInventory();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("list");
  const [activeMakerTab, setActiveMakerTab] = useState("よく使う");
  const [selectedPart, setSelectedPart] = useState<PartMaster | null>(null);
  const [workerName, setWorkerName] = useState("未設定");

  useEffect(() => {
    // 日報/ホワイトボードと共通の担当者情報を取得
    const savedWorker = localStorage.getItem("selectedWorker");
    if (savedWorker) {
      setWorkerName(savedWorker);
      // 在庫アプリ用の使用者名としても同期
      localStorage.setItem("inventory_user_name", savedWorker);
    }
  }, []);

  const mainTabs = [
    { id: "list", label: "在庫一覧", icon: Package },
    { id: "history", label: "使用履歴", icon: History },
    { id: "entry", label: "登録", icon: PlusCircle },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header */}
      <header className="bg-white px-6 py-5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">在庫管理</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Inventory Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 shadow-sm">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-[12px] font-black text-blue-700">{workerName}</span>
          </div>
          <button 
            onClick={() => refresh()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all active:scale-90"
          >
            <RefreshCw className={`w-5 h-5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. Maker Selector (Only for List Tab) */}
      {activeMainTab === "list" && (
        <div className="bg-white border-b sticky top-[76px] z-30">
          <div className="flex overflow-x-auto no-scrollbar px-4 py-3 gap-2">
            {MAKER_LIST.map((maker) => (
              <button
                key={maker}
                onClick={() => setActiveMakerTab(maker)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-black whitespace-nowrap transition-all ${
                  activeMakerTab === maker 
                    ? "bg-slate-800 text-white shadow-md shadow-slate-200 scale-105" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {maker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <main className="flex-1 p-4 pb-32">
        {activeMainTab === "list" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InventoryList filter={activeMakerTab} onSelect={setSelectedPart} />
          </div>
        )}
        {activeMainTab === "history" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UsageHistory />
          </div>
        )}
        {activeMainTab === "entry" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StockEntry />
          </div>
        )}
      </main>

      {/* 4. Part Details Overlay */}
      {selectedPart && (
        <PartDetails part={selectedPart} onClose={() => setSelectedPart(null)} />
      )}

      {/* 5. Main Tabs (Bottom Fixed) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[28px] p-2 flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as MainTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[22px] transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 font-black" 
                    : "text-slate-400 font-bold hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                <span className="text-[13px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
