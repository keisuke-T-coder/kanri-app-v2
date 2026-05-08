"use client";

import React from "react";
import { useInventory } from "../_context/InventoryContext";
import { TOP_21_PARTS, PartMaster } from "../_types/schema";
import { ChevronRight, Package, AlertCircle } from "lucide-react";

interface InventoryListProps {
  filter: string;
  onSelect: (part: PartMaster) => void;
}

export function InventoryList({ filter, onSelect }: InventoryListProps) {
  const { parts, loading } = useInventory();

  // フィルタリングロジック
  // 表記の揺れを吸収する正規化関数
  const normalize = (str: string) => {
    return str
      .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角英数記号を半角へ
      .replace(/[（）]/g, (s) => s === "（" ? "(" : ")") // カッコの統一
      .replace(/[〜～ー−ｰ-]/g, "-") // 波ダッシュ、チルダ、長音、ハイフンを半角ハイフンに統一
      .replace(/\s+/g, "") // スペースを全削除
      .toLowerCase();
  };

  const filteredParts = React.useMemo(() => {
    if (filter === "すべて") return parts;
    if (filter === "よく使う") {
      // 正規化後の先頭5文字が一致すれば同じ部品とみなす
      return parts
        .filter(p => 
          TOP_21_PARTS.some(name => 
            normalize(name).substring(0, 5) === normalize(p.id).substring(0, 5)
          )
        )
        .sort((a, b) => {
          const indexA = TOP_21_PARTS.findIndex(name => 
            normalize(name).substring(0, 5) === normalize(a.id).substring(0, 5)
          );
          const indexB = TOP_21_PARTS.findIndex(name => 
            normalize(name).substring(0, 5) === normalize(b.id).substring(0, 5)
          );
          return indexA - indexB;
        });
    }
    return parts.filter(p => normalize(p.makerName) === normalize(filter));
  }, [parts, filter]);

  if (loading && parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Package className="w-12 h-12 mb-4 animate-bounce" />
        <p className="font-black text-sm uppercase tracking-widest">Loading Items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1 mb-4">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {filter} — {filteredParts.length} 件
        </span>
      </div>

      {filteredParts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
          <p className="text-slate-300 font-bold">該当する部品がありません</p>
        </div>
      ) : (
        filteredParts.map((part) => (
          <div 
            key={part.id}
            onClick={() => onSelect(part)}
            className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white hover:border-blue-100 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">
                  {part.makerName}
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  {part.group}
                </span>
              </div>
              <h3 className="text-[15px] font-black text-slate-800 truncate leading-tight">
                {part.id}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">初期</span>
                  <span className="text-sm font-black text-slate-600">{part.initialStock}</span>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">現在</span>
                  <span className={`text-lg font-black ${
                    part.currentStock <= 0 ? "text-red-500" : 
                    part.currentStock < part.initialStock * 0.2 ? "text-amber-500" : "text-blue-600"
                  }`}>
                    {part.currentStock}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="bg-slate-50 p-3 rounded-2xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
