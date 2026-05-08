"use client";

import React, { useState, useEffect } from "react";
import { useInventory } from "../_context/InventoryContext";
import { StockOperation } from "../_types/schema";
import { CheckCircle2, AlertCircle, Package, User, Hash, Search, ArrowRight } from "lucide-react";

export function StockEntry() {
  const { parts, addHistory } = useInventory();
  
  const [partId, setPartId] = useState("");
  const [operation, setOperation] = useState<StockOperation>("使用");
  const [quantity, setQuantity] = useState("1");
  const [userName, setUserName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      user: userName
    });

    if (result.success) {
      setMessage({ type: 'success', text: '正常に登録されました' });
      setPartId("");
      setSearchQuery("");
      setQuantity("1");
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
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 pb-10">
        
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
    </div>
  );
}
