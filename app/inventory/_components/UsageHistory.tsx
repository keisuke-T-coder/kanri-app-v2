"use client";

import React, { useState } from "react";
import { useInventory } from "../_context/InventoryContext";
import { StockOperation } from "../_types/schema";
import { Search, Filter, History as HistoryIcon, Clock, User, Briefcase, Trash2, Loader2 } from "lucide-react";
import { useCases } from "../../cases/_context/CasesContext";

export function UsageHistory() {
  const { histories, deleteHistory, loading } = useInventory();
  const { allCases } = useCases();
  const [query, setQuery] = useState("");
  const [opFilter, setOpFilter] = useState<StockOperation | "すべて">("すべて");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const CLIENTS = [
    { id: "living", name: "リビング" },
    { id: "house", name: "ハウス" },
    { id: "hidamari", name: "ひだまり" },
    { id: "takeyoshi", name: "タケヨシ" },
    { id: "lts", name: "LTS" }
  ];

  const getLinkedCase = (h: any) => {
    const caseId = h.idLiving || h.idHouse || h.idHidamari || h.idTotal || h.idTakeyoshi || h.idLts;
    if (!caseId) return null;
    
    for (const clientId in allCases) {
      const found = allCases[clientId].find(c => c.id === caseId);
      if (found) {
        return {
          title: found.title || found.ownerName,
          clientName: CLIENTS.find(cl => cl.id === clientId)?.name || clientId
        };
      }
    }
    return null;
  };

  const handleDelete = async (rowNumber: number) => {
    if (!window.confirm("この履歴を削除してもよろしいですか？（在庫数に影響します）")) return;
    
    setDeletingId(rowNumber);
    try {
      const result = await deleteHistory(rowNumber);
      if (!result.success) {
        alert(result.error || "削除に失敗しました");
      }
    } catch (e) {
      alert("エラーが発生しました");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHistories = React.useMemo(() => {
    return histories.filter(h => {
      const matchQuery = !query || h.partId.toLowerCase().includes(query.toLowerCase());
      const matchOp = opFilter === "すべて" || h.operation === opFilter;
      return matchQuery && matchOp;
    });
  }, [histories, query, opFilter]);

  const getStatusStyle = (op: StockOperation) => {
    switch (op) {
      case "使用": return "bg-red-50 text-red-600 border-red-100";
      case "入荷": return "bg-green-50 text-green-600 border-green-100";
      case "持出": return "bg-blue-50 text-blue-600 border-blue-100";
      case "返却": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // 変換できない場合はそのまま
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\//g, "/");
    } catch {
      return dateStr;
    }
  };

  if (loading && histories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <HistoryIcon className="w-12 h-12 mb-4 animate-spin" />
        <p className="font-black text-sm uppercase tracking-widest">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[24px] p-4 shadow-sm border border-white space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="部品名で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {["すべて", "使用", "入荷", "持出", "返却"].map((op) => (
            <button
              key={op}
              onClick={() => setOpFilter(op as any)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black whitespace-nowrap transition-all ${
                opFilter === op 
                  ? "bg-slate-800 text-white" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold">履歴が見つかりません</p>
          </div>
        ) : (
          filteredHistories.map((h, idx) => (
            <div 
              key={`${h.partId}-${idx}`}
              className="group bg-white rounded-[22px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white flex flex-col gap-3 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getStatusStyle(h.operation)}`}>
                      {h.operation}
                    </span>
                    <span className="text-[13px] font-black text-slate-800 line-clamp-1">
                      {h.partId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{formatDate(h.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{h.user}</span>
                    </div>
                    {getLinkedCase(h) && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full border border-blue-100 max-w-[280px]">
                        <Briefcase className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="text-[9px] font-black truncate">
                          {getLinkedCase(h)?.clientName}: {getLinkedCase(h)?.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-black ${h.operation === '使用' ? 'text-red-500' : h.operation === '入荷' ? 'text-green-600' : 'text-slate-600'}`}>
                      {h.operation === '使用' ? '-' : h.operation === '入荷' ? '+' : ''}{h.quantityChange}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">個数</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(h.rowNumber)}
                    disabled={deletingId === h.rowNumber}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                  >
                    {deletingId === h.rowNumber ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
