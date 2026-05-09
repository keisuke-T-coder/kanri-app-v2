"use client";

import React, { useState, useMemo } from "react";
import { CaseItem } from "../_types/schema";
import { useInventory } from "../../inventory/_context/InventoryContext";
import { Package, Plus, History, Loader2, X, Search, Check } from "lucide-react";
import { StockOperation } from "../../inventory/_types/schema";

interface CasePartsManagerProps {
  item: CaseItem;
}

const OPERATION_COLORS: Record<string, string> = {
  "使用": "text-red-500 bg-red-50",
  "入荷": "text-green-500 bg-green-50",
  "持出": "text-blue-500 bg-blue-50",
  "返却": "text-slate-500 bg-slate-50",
};

const ASSIGNEES = ["佐藤", "田中", "南", "新田", "徳重"];

export function CasePartsManager({ item }: CasePartsManagerProps) {
  const { parts, histories, addHistory, loading, refreshing } = useInventory();
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [operation, setOperation] = useState<StockOperation>("使用");
  const [quantity, setQuantity] = useState(1);
  const [selectedUser, setSelectedUser] = useState(item.assignee || "徳重");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 案件に紐づく履歴の抽出
  const caseHistories = useMemo(() => {
    const caseId = String(item.id);
    const caseType = item.clientId; // "living", "house", etc.

    const CASE_ID_FIELD_MAP: Record<string, string> = {
      living: "idLiving",
      house: "idHouse",
      hidamari: "idHidamari",
      total: "idTotal",
      takeyoshi: "idTakeyoshi",
      lts: "idLts",
    };

    const field = CASE_ID_FIELD_MAP[caseType] as keyof typeof histories[0];
    if (!field) return [];

    return histories
      .filter(h => String(h[field] || "") === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [histories, item.id, item.clientId]);

  // 部品検索
  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return parts.filter(p => 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.makerName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [parts, searchQuery]);

  const handleRegister = async () => {
    if (!selectedPartId || quantity <= 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await addHistory(
        {
          partId: selectedPartId,
          operation: operation,
          quantityChange: quantity,
          user: selectedUser
        },
        String(item.id),
        item.clientId
      );

      if (res.success) {
        setIsRegistering(false);
        setSelectedPartId("");
        setSearchQuery("");
        setQuantity(1);
      } else {
        alert("登録に失敗しました: " + res.error);
      }
    } catch (e) {
      alert("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 履歴セクション */}
      <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-slate-400">
            <Package className="w-4 h-4 mr-2 opacity-60" />
            <span className="text-xs font-bold uppercase tracking-widest">使用部品履歴</span>
          </div>
            <button 
            onClick={() => setIsRegistering(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-xl text-[11px] font-black shadow-md hover:shadow-lg active:scale-95 transition-all border border-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>部品を追加</span>
          </button>
        </div>

        {caseHistories.length === 0 ? (
          <div className="py-8 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-widest">使用履歴はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {caseHistories.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-black/[0.02] rounded-2xl border border-black/[0.02]">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${OPERATION_COLORS[h.operation]}`}>
                      {h.operation}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(h.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-700 truncate">
                    {h.partId}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-800">
                    {h.quantityChange} <span className="text-[10px] text-slate-400">個</span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400">
                    {h.user}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 登録モーダル */}
      {isRegistering && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#f8f6f0]/50">
              <h3 className="text-sm font-black text-slate-800">部品の使用・入荷を登録</h3>
              <button onClick={() => setIsRegistering(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
              {/* 部品検索 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">部品を検索</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="品名・メーカーを入力..."
                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-300 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                </div>
                {filteredParts.length > 0 && !selectedPartId && (
                  <div className="mt-2 space-y-1">
                    {filteredParts.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          setSelectedPartId(p.id);
                          setSearchQuery(p.id);
                        }}
                        className="w-full text-left p-3 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 transition-all group"
                      >
                        <div className="text-xs font-black text-slate-700 group-hover:text-primary">{p.id}</div>
                        <div className="text-[10px] font-bold text-slate-400">{p.makerName}</div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPartId && (
                  <div className="mt-2 p-3 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-primary truncate">{selectedPartId}</div>
                    </div>
                    <button onClick={() => setSelectedPartId("")} className="p-1 hover:bg-primary/10 rounded-lg">
                      <X className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                )}
              </div>

              {/* 操作選択 */}
              <div className="grid grid-cols-2 gap-2">
                {(["使用", "入荷", "持出", "返却"] as const).map(op => (
                  <button 
                    key={op}
                    onClick={() => setOperation(op)}
                    className={`py-3 rounded-2xl text-[11px] font-black transition-all border ${
                      operation === op 
                        ? "bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-200" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>

              {/* 数量 & 担当者 */}
              <div className="flex space-x-3">
                <div className="w-1/3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">数量</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-4 bg-white border border-slate-300 rounded-2xl text-sm font-black text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">担当者</label>
                  <div className="flex flex-wrap gap-1">
                    {ASSIGNEES.map(u => (
                      <button 
                        key={u}
                        onClick={() => setSelectedUser(u)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                          selectedUser === u ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-black/5">
              <button 
                onClick={handleRegister}
                disabled={isSubmitting || !selectedPartId}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" /> 登録する</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{` .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); } `}</style>
    </div>
  );
}
