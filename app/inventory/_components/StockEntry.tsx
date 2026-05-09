"use client";

import React, { useState, useEffect } from "react";
import { useInventory } from "../_context/InventoryContext";
import { StockOperation, CaseType } from "../_types/schema";
import { CheckCircle2, AlertCircle, Package, User, Hash, Search, ArrowRight, Briefcase, Loader2 } from "lucide-react";
import { useCases, CaseItem } from "../../cases/_context/CasesContext";

export function StockEntry() {
  const { parts, addHistory } = useInventory();
  
  const [partId, setPartId] = useState("");
  const [operation, setOperation] = useState<StockOperation>("使用");
  const [quantity, setQuantity] = useState("1");
  const [userName, setUserName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 案件紐付け用ステート
  const { allCases } = useCases();
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [selectedClient, setSelectedClient] = useState<CaseType | null>(null);

  const uncompletedCases = React.useMemo(() => {
    if (!selectedClient) return [];
    const clientCases = allCases[selectedClient] || [];
    return clientCases.filter(c => 
      c.status !== "完了" && 
      c.status !== "請求済み" &&
      c.status !== "完了（未請求）"
    );
  }, [allCases, selectedClient]);

  const CLIENTS: { id: CaseType, name: string }[] = [
    { id: "living", name: "リビング" },
    { id: "house", name: "ハウス" },
    { id: "hidamari", name: "ひだまり" },
    { id: "takeyoshi", name: "タケヨシ" },
    { id: "lts", name: "LTS" }
  ];

  // 前回入力または共有されている担当者名を保存しておく
  useEffect(() => {
    // まず日報/ホワイトボード共有の担当者を優先
    const shared = localStorage.getItem("selectedWorker");
    const localSaved = localStorage.getItem("inventory_user_name");
    
    if (shared) {
      setUserName(shared);
    } else if (localSaved) {
      setUserName(localSaved);
    }
  }, []);

  const filteredParts = parts.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.makerName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10); // 候補を10件に制限

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId || !userName || !quantity) {
      setMessage({ type: 'error', text: 'すべての項目を入力してください' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await addHistory({
      partId,
      operation,
      quantityChange: Number(quantity),
      user: userName,
      caseId: selectedCase?.id,
      caseType: selectedCase?.clientId as CaseType
    });

    if (result.success) {
      setMessage({ type: 'success', text: '正常に登録されました' });
      setPartId("");
      setSearchQuery("");
      setQuantity("1");
      setSelectedCase(null);
      setSelectedClient(null);
      // ユーザー名は次回のために保存
      localStorage.setItem("inventory_user_name", userName);
    } else {
      setMessage({ type: 'error', text: result.error || '登録に失敗しました' });
    }
    setIsSubmitting(false);
  };

  const getOpButtonStyle = (op: StockOperation) => {
    const isActive = operation === op;
    switch (op) {
      case "使用": return isActive ? "bg-red-500 text-white shadow-lg scale-105" : "bg-red-50 text-red-400";
      case "入荷": return isActive ? "bg-green-600 text-white shadow-lg scale-105" : "bg-green-50 text-green-500";
      case "持出": return isActive ? "bg-blue-600 text-white shadow-lg scale-105" : "bg-blue-50 text-blue-500";
      case "返却": return isActive ? "bg-slate-800 text-white shadow-lg scale-105" : "bg-slate-50 text-slate-400";
      default: return "";
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <form onSubmit={handleSubmit} className={`space-y-6 pb-10 transition-all ${isSubmitting ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        
        {/* Operation Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(["使用", "入荷", "持出", "返却"] as StockOperation[]).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setOperation(op)}
              className={`py-6 rounded-[24px] text-lg font-black transition-all ${getOpButtonStyle(op)}`}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Part Selection */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-white space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">部品を選択</label>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="部品名を入力して検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {searchQuery && filteredParts.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-2 space-y-1 mt-2 border border-slate-100">
              {filteredParts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setPartId(p.id); setSearchQuery(p.id); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${
                    partId === p.id ? "bg-blue-600 text-white" : "hover:bg-white text-slate-600"
                  }`}
                >
                  {p.id}
                  <span className={`block text-[9px] mt-0.5 ${partId === p.id ? "text-blue-100" : "text-slate-400"}`}>
                    {p.makerName} / 現在在庫: {p.currentStock}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Case Selection (Optional) - 2 Step Selection */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-white space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">案件を紐付ける (任意)</label>
            </div>
            {(selectedCase || selectedClient) && (
              <button type="button" onClick={() => { setSelectedCase(null); setSelectedClient(null); }} className="text-[10px] font-bold text-red-400 underline">リセット</button>
            )}
          </div>

          {selectedCase ? (
            /* Selected Case Display */
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between animate-in zoom-in-95 duration-200">
              <div className="flex flex-col">
                <span className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-md self-start mb-1 uppercase tracking-tighter">
                  {CLIENTS.find(c => c.id === selectedCase.clientId)?.name}
                </span>
                <span className="text-[13px] font-bold text-slate-700">{selectedCase.title || selectedCase.ownerName}</span>
                <span className="text-[10px] font-bold text-slate-400">{selectedCase.propertyName}</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
          ) : !selectedClient ? (
            /* Step 1: Client Selection */
            <div className="grid grid-cols-3 gap-2">
              {CLIENTS.map(client => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClient(client.id)}
                  className="py-3 px-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                >
                  {client.name}
                </button>
              ))}
            </div>
          ) : (
            /* Step 2: Uncompleted Case List */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  {CLIENTS.find(c => c.id === selectedClient)?.name}の未完了案件
                </span>
                <button type="button" onClick={() => setSelectedClient(null)} className="text-[10px] font-bold text-slate-400 underline">変更</button>
              </div>
              <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {uncompletedCases.length === 0 ? (
                  <p className="text-center py-4 text-[11px] font-bold text-slate-300 bg-slate-50 rounded-xl italic">未完了案件はありません</p>
                ) : (
                  uncompletedCases.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCase(c)}
                      className="w-full p-4 flex flex-col items-start bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left shadow-sm group"
                    >
                      <span className="text-[12px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {c.title || c.ownerName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{c.propertyName}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quantity & User */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-white space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-300" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">数量</label>
            </div>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-2xl font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0"
              required
            />
          </div>
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-white space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-300" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">使用者</label>
            </div>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="氏名を入力"
              className="w-full text-sm font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
              required
            />
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !partId}
          className="w-full bg-blue-600 disabled:bg-slate-200 text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isSubmitting ? "送信中..." : "登録を実行する"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 sm:absolute z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px] rounded-[40px] animate-in fade-in duration-300">
          <div className="bg-white/80 p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-white">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <span className="text-sm font-black text-blue-600 uppercase tracking-widest">データ反映中...</span>
            <p className="text-[10px] font-bold text-slate-400 mt-2">スプレッドシートに書き込み中です</p>
          </div>
        </div>
      )}
    </div>
  );
}
