"use client";

import React from "react";
import { AlertTriangle, Check, ArrowRight, Calendar, User, MapPin } from "lucide-react";
import { useCases } from "../_context/CasesContext";
import { useRouter } from "next/navigation";

export function CaseNotificationAlert() {
  const { alertCases, showNotificationAlert, setShowNotificationAlert, setActiveTab, setActiveClient } = useCases();
  const router = useRouter();

  if (!showNotificationAlert || alertCases.length === 0) return null;

  const handleSeeCases = () => {
    setActiveClient("priority");
    setActiveTab("list");
    setShowNotificationAlert(false);
    router.push("/cases");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#f8f6f0] w-full max-w-lg rounded-[40px] shadow-2xl border border-white/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header - Warning Style */}
        <div className="p-8 bg-white border-b border-red-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-red-200 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-600 leading-tight">通知確認が必要な案件があります</h2>
            <p className="text-sm font-bold text-red-400 mt-1">現在 {alertCases.length} 件の未確認案件があります</p>
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh] space-y-4 no-scrollbar bg-white/30">
          {alertCases.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-[15px] font-black text-slate-800 leading-tight">{c.title}</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center text-slate-500 gap-2">
                  <MapPin className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  <span className="text-[11px] font-bold truncate">{c.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-slate-500 gap-2">
                    <User className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    <span className="text-[11px] font-bold">{c.assignee}</span>
                  </div>
                  <div className="flex items-center text-slate-500 gap-2">
                    <Calendar className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    <span className="text-[11px] font-bold">{c.requestDate}</span>
                  </div>
                  <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    c.status === "完了" ? "bg-green-50 text-green-500 border-green-100" : "bg-orange-50 text-orange-500 border-orange-100"
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-8 bg-white border-t border-slate-50 grid grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20 shadow-xl">
              このアラートを一旦閉じます
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
            <button 
              onClick={() => setShowNotificationAlert(false)}
              className="w-full flex items-center justify-center gap-2 py-5 bg-slate-100 text-slate-600 rounded-[28px] font-black text-sm active:scale-95 transition-all"
            >
              <span>✅ 確認した</span>
            </button>
          </div>
          <div className="relative group">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-600 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20 shadow-xl">
              優先案件の一覧画面へ移動
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
            </div>
            <button 
              onClick={handleSeeCases}
              className="w-full flex items-center justify-center gap-2 py-5 bg-red-600 text-white rounded-[28px] font-black text-sm shadow-xl shadow-red-100 active:scale-95 transition-all"
            >
              <span>案件を見る</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
