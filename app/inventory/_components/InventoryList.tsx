"use client";

import React from "react";
import { useInventory } from "../_context/InventoryContext";
import { TOP_21_PARTS, PartMaster } from "../_types/schema";
import { ChevronRight, Package, AlertCircle, TrendingDown, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { NewPartModal } from "./NewPartModal";

interface InventoryListProps {
  filter: string;
  onSelect: (part: PartMaster) => void;
}

export function InventoryList({ filter, onSelect }: InventoryListProps) {
  const { parts, loading, refreshing, refresh } = useInventory();
  const [statusFilter, setStatusFilter] = React.useState<"all" | "適正" | "低在庫" | "欠品">("all");
  const [showNewPartModal, setShowNewPartModal] = React.useState(false);

  // 表記の揺れを吸収する正規化関数
  const normalize = (str: string) => {
    return str
      .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[（）]/g, (s) => s === "（" ? "(" : ")")
      .replace(/[〜〜ー−ｰ-]/g, "-")
      .replace(/\s+/g, "")
      .toLowerCase();
  };

  const getGroupColor = (group: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    ];
    if (!group) return "bg-slate-100 text-slate-500 border-slate-200";
    let hash = 0;
    for (let i = 0; i < group.length; i++) {
      hash = group.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStockStatus = (part: PartMaster) => {
    if (part.currentStock <= 0) return { label: "欠品", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: AlertCircle };
    if (part.currentStock < part.initialStock * 0.3) return { label: "低在庫", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: TrendingDown };
    return { label: "適正", color: "text-blue-600", bg: "bg-white", border: "border-slate-100", icon: CheckCircle2 };
  };

  const filteredParts = React.useMemo(() => {
    const baseFiltered = filter === "すべて" ? parts : 
                         filter === "よく使う" ? parts.filter(p => {
                           const normPartId = normalize(p.id);
                           if (normPartId.length < 3) return false;
                           return TOP_21_PARTS.some(name => {
                             const normName = normalize(name);
                             if (normPartId.startsWith(normName) || normName.startsWith(normPartId)) {
                               if (normPartId.length <= 6 || normName.length <= 6) {
                                 return Math.abs(normPartId.length - normName.length) <= 1;
                               }
                               return true;
                             }
                             return false;
                           });
                         }).sort((a, b) => {
                           const indexA = TOP_21_PARTS.findIndex(name => normalize(name) === normalize(a.id) || normalize(a.id).startsWith(normalize(name)));
                           const indexB = TOP_21_PARTS.findIndex(name => normalize(name) === normalize(b.id) || normalize(b.id).startsWith(normalize(name)));
                           return indexA - indexB;
                         }) : 
                         parts.filter(p => normalize(p.makerName) === normalize(filter));

    if (statusFilter === "all") return baseFiltered;
    return baseFiltered.filter(p => {
      const status = getStockStatus(p);
      return status.label === statusFilter;
    });
  }, [parts, filter, statusFilter]);


  if (loading && parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Package className="w-12 h-12 mb-4 animate-bounce" />
        <p className="font-black text-sm uppercase tracking-widest">Loading Items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 px-1">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
          {filter} — {filteredParts.length} 件
        </span>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNewPartModal(true)}
            className="h-8 pl-2 pr-4 bg-blue-600 text-white rounded-xl flex items-center gap-1.5 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-tighter whitespace-nowrap">新規部品</span>
          </button>
          <button 
            onClick={refresh}
            disabled={refreshing}
            className={`w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 transition-all active:scale-95 ${refreshing ? "opacity-30" : "hover:bg-slate-50"}`}
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-1.5 bg-white/50 p-1 rounded-2xl border border-slate-100 shadow-sm ml-2">
            {[
              { id: "all", label: "すべて", color: "bg-slate-100 text-slate-600" },
              { id: "適正", label: "適正", color: "bg-blue-500 text-white shadow-blue-200" },
              { id: "低在庫", label: "低在庫", color: "bg-amber-500 text-white shadow-amber-200" },
              { id: "欠品", label: "欠品", color: "bg-red-500 text-white shadow-red-200" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all active:scale-95 ${
                  statusFilter === btn.id 
                    ? `${btn.color} shadow-lg ring-2 ring-white` 
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredParts.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold">該当する部品がありません</p>
          </div>
        ) : (
          filteredParts.map((part) => {
            const status = getStockStatus(part);
            const StatusIcon = status.icon;
            return (
              <div 
                key={part.id}
                onClick={() => onSelect(part)}
                className={`group relative rounded-[32px] p-6 border-2 transition-all active:scale-[0.97] cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${status.bg} ${status.border}`}
              >
                {/* Upper Section: Badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black bg-slate-800 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter self-start shadow-sm">
                      {part.makerName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">グループ</span>
                      <span className={`text-[13px] font-black w-6 h-6 flex items-center justify-center rounded-lg border shadow-sm ${getGroupColor(part.group)}`}>
                        {part.group || "-"}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-inner ${status.bg} ${status.border} ${status.color}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{status.label}</span>
                  </div>
                </div>

                {/* Middle Section: Part Name */}
                <div className="mb-6 h-12 flex items-center">
                  <h3 className="text-[15px] font-black text-slate-800 leading-tight line-clamp-2">
                    {part.id}
                  </h3>
                </div>

                {/* Bottom Section: Stock Info */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                  <div className="flex gap-6">
                    <div className="flex flex-col justify-end">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">初期</span>
                      <span className="text-xs font-black text-slate-500">{part.initialStock}</span>
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">現在</span>
                      <span className={`text-4xl font-black leading-none ${status.color}`}>
                        {part.currentStock}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 group-hover:bg-blue-600 group-hover:text-white p-3 rounded-2xl text-slate-200 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Glass decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/5 transition-all"></div>
              </div>
            );
          })
        )}
      </div>

      {showNewPartModal && (
        <NewPartModal 
          onClose={() => setShowNewPartModal(false)} 
        />
      )}
    </div>
  );
}
