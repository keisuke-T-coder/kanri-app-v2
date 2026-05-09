"use client";

import React, { useState } from "react";
import { useInventory } from "../_context/InventoryContext";
import { MAKER_MAP } from "../_types/schema";
import { X, Check, Loader2, Package, Tag, Factory, Hash, AlertCircle, Plus, Minus } from "lucide-react";

interface NewPartModalProps {
  onClose: () => void;
}

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

export function NewPartModal({ onClose }: NewPartModalProps) {
  const { addPartMaster } = useInventory();
  
  const [id, setId] = useState("");
  const [makerId, setMakerId] = useState(Object.keys(MAKER_MAP)[0]);
  const [group, setGroup] = useState("");
  const [initialStock, setInitialStock] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) {
      setError("品名/IDを入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addPartMaster({
        id: id.trim(),
        makerId,
        group: group.trim() || "未設定",
        initialStock: Number(initialStock) || 0
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "登録に失敗しました");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#f8f6f0] w-full max-w-md rounded-[40px] shadow-2xl border border-white/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">新規部品をシステムに登録</h2>
              <p className="text-[10px] font-bold text-slate-400">マスターデータを作成します</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar max-h-[70vh]">
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Part Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Tag className="w-3 h-3" /> 品名 / ID
            </label>
            <input 
              type="text" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="例: ゴム玉（大） TF-10R-L"
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* Maker Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Factory className="w-3 h-3" /> メーカー (既存リストから選択)
            </label>
            <div className="relative">
              <select 
                value={makerId}
                onChange={(e) => setMakerId(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm appearance-none"
              >
                {Object.entries(MAKER_MAP).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Tag className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Group */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              グループ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GROUPS.map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all ${
                    group === g 
                      ? "bg-slate-800 text-white shadow-lg shadow-slate-200" 
                      : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="または直接入力..."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Initial Stock */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Hash className="w-3 h-3" /> 初期在庫数
            </label>
            <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-3xl p-2 shadow-sm">
              <button 
                type="button"
                onClick={() => setInitialStock(prev => Math.max(0, Number(prev) - 1).toString())}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all active:scale-90"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input 
                type="number" 
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="flex-1 bg-transparent text-center text-xl font-black outline-none border-none focus:ring-0"
              />
              <button 
                type="button"
                onClick={() => setInitialStock(prev => (Number(prev) + 1).toString())}
                className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-90"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-white/50 border-t border-black/5">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !id.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                システムに登録する
              </>
            )}
          </button>
        </div>

        {/* Global Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-[#f8f6f0]/60 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center border border-white">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">マスタ登録中...</span>
              <p className="text-[10px] font-bold text-slate-400 mt-2">スプレッドシートを更新しています</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
