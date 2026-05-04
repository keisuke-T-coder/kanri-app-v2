"use client";

import { useCases } from "../../_context/CasesContext";
import { CaseCard } from "../../_components/CaseCard";
import { ClientTabs } from "../../_components/ClientTabs";
import { BottomNavigation } from "../../_components/BottomNavigation";
import { ClientId, CLIENT_TABS } from "../../_types/schema";
import { Loader2, Search as SearchIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CaseListPage() {
  const { clientId } = useParams();
  const { allCases, loading, error } = useCases();
  
  const currentClientId = (clientId as ClientId) || "living";
  const cases = allCases[currentClientId] || [];
  const clientInfo = CLIENT_TABS.find(t => t.id === currentClientId);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f0] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-black/5 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-black text-slate-800 tracking-tighter flex items-center">
            {clientInfo?.label}
            <span className="ml-2 px-2 py-0.5 bg-black/5 rounded text-[10px] text-slate-400">
              {cases.length}件
            </span>
          </h1>
          <Link href="/cases/search" className="p-2 bg-black/5 rounded-full text-slate-400 hover:text-primary transition-colors">
            <SearchIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Tabs */}
        <ClientTabs activeTab={currentClientId} />

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-xs font-bold tracking-widest">LOADING DATA...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center glass rounded-3xl border border-red-100 bg-red-50/30">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {cases.length > 0 ? (
              cases.map((item) => <CaseCard key={item.id} item={item} />)
            ) : (
              <div className="py-20 text-center opacity-30">
                <p className="text-sm font-bold">案件がありません</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />

      <style jsx global>{`
        :root {
          --primary: #eaaa43; /* Match V2 Orange */
        }
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
