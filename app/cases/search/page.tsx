"use client";

import { useState, useMemo } from "react";
import { useCases } from "../_context/CasesContext";
import { CaseCard } from "../_components/CaseCard";
import { BottomNavigation } from "../_components/BottomNavigation";
import { Search as SearchIcon, X, Filter, Loader2 } from "lucide-react";
import { ClientId, Status, CLIENT_TABS } from "../_types/schema";

export default function SearchPage() {
  const { allCases, loading } = useCases();
  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientId | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<Status | "all">("all");

  const filteredCases = useMemo(() => {
    let results = Object.values(allCases).flat();

    if (selectedClient !== "all") {
      results = results.filter((c) => c.clientId === selectedClient);
    }
    if (selectedStatus !== "all") {
      results = results.filter((c) => c.status === selectedStatus);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.assignee.toLowerCase().includes(q) ||
          (c.content && c.content.toLowerCase().includes(q))
      );
    }
    return results;
  }, [allCases, query, selectedClient, selectedStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f0] pb-32">
      <div className="sticky top-0 z-10 glass border-b border-black/5 p-4 space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="案件名、住所、担当者で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all text-slate-800"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full"
            >
              <X className="w-3 h-3 text-slate-500" />
            </button>
          )}
        </div>

        <div className="max-w-2xl mx-auto flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value as any)}
            className="flex-none bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none appearance-none text-slate-700"
          >
            <option value="all">すべてのクライアント</option>
            {CLIENT_TABS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="flex-none bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none appearance-none text-slate-700"
          >
            <option value="all">すべてのステータス</option>
            <option value="未完了">未完了</option>
            <option value="完了">完了</option>
          </select>
        </div>
      </div>

      <main className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366f1] opacity-30" />
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              検索結果: {filteredCases.length}件
            </p>
            <div className="grid gap-4">
              {filteredCases.map((item) => (
                <CaseCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
