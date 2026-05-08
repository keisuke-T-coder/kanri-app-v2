"use client";

import React, { useState } from "react";
import { useInventory } from "../_context/InventoryContext";
import { PartMaster, StockOperation } from "../_types/schema";
import { X, Package, Clock, Hash, CheckCircle2, AlertCircle, Minus, Plus, User } from "lucide-react";

interface PartDetailsProps {
  part: PartMaster;
  onClose: () => void;
}

export function PartDetails({ part, onClose }: PartDetailsProps) {
  const { histories, addHistory } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
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

  const getWorkerName = () => {
    return localStorage.getItem("selectedWorker") || localStorage.getItem("inventory_user_name") || "未設定";
  };

  // この部品に関連する履歴のみ抽出
  const relatedHistories = histories.filter(h => h.partId === part.id).slice(0, 5);

  const handleQuickAction = async (op: StockOperation) => {
    const userName = getWorkerName();
    
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
      <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex gap-2 mb-1.5">
                <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-lg uppercase tracking-tighter shadow-sm">{part.makerName}</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border shadow-sm ${getGroupColor(part.group)}`}>{part.group || "未分類"}</span>
              </div>
              <h2 className="text-[20px] font-black text-slate-800 leading-tight">{part.id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Stats Grid - Extra Large */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-50 rounded-[32px] p-7 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">初期在庫</span>
              <span className="text-3xl font-black text-slate-600">{part.initialStock}</span>
            </div>
            <div className={`rounded-[32px] p-7 border ${
              part.currentStock <= 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
                part.currentStock <= 0 ? 'text-red-400' : 'text-blue-400'
              }`}>現在在庫</span>
              <span className={`text-5xl font-black leading-none ${
                part.currentStock <= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>{part.currentStock}</span>
            </div>
          </div>

          {/* Quick Registration - Rich UI */}
          <div className="space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">クイック在庫登録</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[12px] font-bold text-slate-600">{getWorkerName()}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              {/* Rich Stepper */}
              <div className="flex items-center gap-6 bg-white p-2 rounded-[28px] border-2 border-slate-100 shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-90"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">数量</span>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-16 text-center text-3xl font-black text-slate-800 bg-transparent focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                  className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-2xl text-white transition-all active:scale-90 shadow-lg shadow-blue-100"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                {(["使用", "入荷", "持出", "返却"] as StockOperation[]).map(op => (
                  <button
                    key={op}
                    onClick={() => handleQuickAction(op)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center justify-center gap-1 py-5 rounded-[24px] text-[14px] font-black transition-all active:scale-95 border-2 ${
                      op === '使用' ? 'bg-white hover:bg-red-50 text-red-500 border-slate-100 hover:border-red-100' :
                      op === '入荷' ? 'bg-white hover:bg-green-50 text-green-500 border-slate-100 hover:border-green-100' :
                      op === '持出' ? 'bg-white hover:bg-blue-50 text-blue-500 border-slate-100 hover:border-blue-100' :
                      'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                    }`}
                  >
                    <span>{op}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {op === '使用' ? '出庫する' : op === '入荷' ? '入庫する' : op === '持出' ? '現場へ' : '戻す'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span className="text-sm font-black">{message.text}</span>
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
                        <span className="text-[11px] font-bold text-slate-400">{formatDate(h.createdAt)}</span>
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
