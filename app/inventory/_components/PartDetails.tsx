"use client";

import React, { useState } from "react";
import { useInventory } from "../_context/InventoryContext";
import { PartMaster, StockOperation } from "../_types/schema";
import { X, Package, Clock, Hash, CheckCircle2, AlertCircle } from "lucide-react";

interface PartDetailsProps {
  part: PartMaster;
  onClose: () => void;
}

export function PartDetails({ part, onClose }: PartDetailsProps) {
  const { histories, addHistory } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // この部品に関連する履歴のみ抽出
  const relatedHistories = histories.filter(h => h.partId === part.id).slice(0, 5);

  const handleQuickAction = async (op: StockOperation) => {
    const userName = localStorage.getItem("inventory_user_name") || "未設定";
    setIsSubmitting(true);
    setMessage(null);

    const result = await addHistory({
      partId: part.id,
      operation: op,
      quantityChange: Number(quantity),
      user: userName
    });

    if (result.success) {
      setMessage({ type: 'success', text: `${op}を登録しました` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || '登録に失敗しました' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-5 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-800 leading-tight">{part.id}</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{part.makerName} / {part.group}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">初期在庫</span>
              <span className="text-2xl font-black text-slate-800">{part.initialStock}</span>
            </div>
            <div className={`rounded-[24px] p-5 border ${
              part.currentStock <= 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                part.currentStock <= 0 ? 'text-red-400' : 'text-blue-400'
              }`}>現在在庫</span>
              <span className={`text-2xl font-black ${
                part.currentStock <= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>{part.currentStock}</span>
            </div>
          </div>

          {/* Quick Registration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">クイック在庫登録</span>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border">
                <Hash className="w-3 h-3 text-slate-400" />
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-10 bg-transparent border-none p-0 text-sm font-black text-slate-700 focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["使用", "入荷", "持出", "返却"] as StockOperation[]).map(op => (
                <button
                  key={op}
                  onClick={() => handleQuickAction(op)}
                  disabled={isSubmitting}
                  className={`py-4 rounded-2xl text-[13px] font-black transition-all active:scale-95 flex flex-col items-center gap-1 ${
                    op === '使用' ? 'bg-red-50 text-red-600 border border-red-100' :
                    op === '入荷' ? 'bg-green-50 text-green-600 border border-green-100' :
                    op === '持出' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}
          </div>

          {/* Recent History for this Part */}
          <div className="space-y-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">この部品の最近の履歴</span>
            <div className="space-y-2">
              {relatedHistories.length === 0 ? (
                <p className="text-center py-6 text-slate-300 text-sm font-bold">履歴がありません</p>
              ) : (
                relatedHistories.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                          h.operation === '使用' ? 'bg-red-50 text-red-500 border-red-100' :
                          h.operation === '入荷' ? 'bg-green-50 text-green-500 border-green-100' :
                          'bg-white text-slate-400'
                        }`}>{h.operation}</span>
                        <span className="text-[11px] font-bold text-slate-400">{h.createdAt}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-600">{h.user}</span>
                    </div>
                    <span className={`text-sm font-black ${
                      h.operation === '使用' ? 'text-red-500' : h.operation === '入荷' ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {h.operation === '使用' ? '-' : h.operation === '入荷' ? '+' : ''}{h.quantityChange}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Padding */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}
