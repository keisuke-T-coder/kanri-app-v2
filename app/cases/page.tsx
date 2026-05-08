"use client";

import { useCases } from "./_context/CasesContext";
import { BottomNavigation } from "./_components/BottomNavigation";
import { CaseList } from "./_components/CaseList";
import { CaseSearch } from "./_components/CaseSearch";
import { CaseTools } from "./_components/CaseTools";
import { CaseDetailOverlay } from "./_components/CaseDetailOverlay";

import { RefreshCw } from "lucide-react";

export default function CasesHomePage() {
  const { activeTab, selectedCase, setSelectedCase, refreshAll, loading } = useCases();

  return (
    <div className="flex flex-col min-h-screen pb-28 bg-[#f8f6f0]">
      {/* Manual Refresh Button (Top Right Floating) */}
      <div className="fixed top-4 right-4 z-[40]">
        <button 
          onClick={() => refreshAll()}
          disabled={loading}
          className={`p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-black/5 text-slate-600 transition-all active:scale-90 hover:bg-white ${loading ? "opacity-50" : ""}`}
          title="最新の情報に更新"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Views Switcher */}
      <main className="flex-1 w-full">
        {activeTab === "list" && <CaseList />}
        {activeTab === "search" && <CaseSearch />}
        {activeTab === "tools" && <CaseTools />}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavigation />

      {/* Case Detail Overlay */}
      {selectedCase && (
        <CaseDetailOverlay 
          item={selectedCase} 
          onClose={() => setSelectedCase(null)} 
        />
      )}

      <style jsx global>{`
        .glass { 
          background: rgba(255, 255, 255, 0.7); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
        }
      `}</style>
    </div>
  );
}
