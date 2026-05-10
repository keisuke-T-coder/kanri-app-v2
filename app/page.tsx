"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Briefcase } from 'lucide-react';
import { useCases } from './cases/_context/CasesContext';

export default function Home() {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = React.useState<string | null>(null);

  const { alertCases, setShowNotificationAlert, isNotificationEnabled, setIsNotificationEnabled } = useCases();
  
  useEffect(() => {
    // 日報画面で保存されている担当者を取得
    const worker = localStorage.getItem('selectedWorker');
    setSelectedWorker(worker);
    
    // ホーム画面表示時に、🥎付き案件があり、かつ通知が有効な場合にアラートを表示
    if (alertCases.length > 0 && isNotificationEnabled) {
      setShowNotificationAlert(true);
    }
  }, [alertCases, setShowNotificationAlert, isNotificationEnabled]);

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Coming soon...\n現在開発中です。次回アップデートをお待ちください。");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col items-center font-sans pb-24 relative overflow-hidden text-slate-800">

      {/* 画面上部のオレンジヘッダー */}
      <div className="w-[92%] max-w-md mt-6 mb-10 bg-[#eaaa43] rounded-[14px] py-4 shadow-sm flex items-center justify-center">
        <h1 className="text-white font-bold tracking-widest text-lg">MENU / メニュー</h1>
      </div>

      {/* 2つのメニューカード */}
      <div className="grid grid-cols-1 gap-4 w-[92%] max-w-md">

        {/* 1. 日報入力 */}
        <Link href="/report" className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] py-10 flex flex-col items-center justify-center active:scale-95 transition-transform border border-transparent hover:border-orange-100">
          <h2 className="text-[1.3rem] font-black text-gray-900 tracking-widest mb-1">日報入力</h2>
          <p className="text-[10px] text-gray-400 font-medium mb-3">Daily Report</p>
          <div className="w-[40%] h-[3px] bg-[#eaaa43] rounded-full"></div>
        </Link>

        {/* 2. ホワイトボード */}
        <Link href="/whiteboard" className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] py-10 flex flex-col items-center justify-center active:scale-95 transition-transform border border-transparent hover:border-orange-100">
          <h2 className="text-[1.3rem] font-black text-gray-900 tracking-widest mb-1">ホワイトボード</h2>
          <p className="text-[10px] text-gray-400 font-medium mb-3">Whiteboard</p>
          <div className="w-[40%] h-[3px] bg-[#eaaa43] rounded-full"></div>
        </Link>

        {/* 3. 案件管理 */}
        <Link href="/cases" className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] py-10 flex flex-col items-center justify-center active:scale-95 transition-transform border border-transparent hover:border-orange-100">
          <h2 className="text-[1.3rem] font-black text-gray-900 tracking-widest mb-1">案件管理</h2>
          <p className="text-[10px] text-gray-400 font-medium mb-3">Case Management</p>
          <div className="w-[40%] h-[3px] bg-[#eaaa43] rounded-full"></div>
        </Link>

        {/* 4. 在庫管理 */}
        <Link href="/inventory" className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] py-10 flex flex-col items-center justify-center active:scale-95 transition-transform border border-transparent hover:border-indigo-100">
          <h2 className="text-[1.3rem] font-black text-indigo-600 tracking-widest mb-1">在庫管理</h2>
          <p className="text-[10px] text-indigo-300 font-medium mb-3">Inventory Management</p>
          <div className="w-[40%] h-[3px] bg-indigo-500 rounded-full"></div>
        </Link>

      </div>

      {/* 通知設定セクション */}
      <div className="w-[92%] max-w-md mt-8">
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-5 border border-white shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${isNotificationEnabled ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
              {isNotificationEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">優先案件の自動通知</h3>
              <p className="text-[10px] font-bold text-slate-400">🥎付き案件を起動時に通知</p>
            </div>
          </div>

          <button 
            onClick={() => setIsNotificationEnabled(!isNotificationEnabled)}
            className={`w-14 h-8 rounded-full transition-all duration-300 relative flex items-center px-1 ${
              isNotificationEnabled ? "bg-[#eaaa43] shadow-inner shadow-orange-900/10" : "bg-slate-200"
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
              isNotificationEnabled ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
        </div>
      </div>

      {/* バージョン表記 (右下) */}
      <span className="fixed bottom-4 right-4 text-[10px] text-gray-400 italic">app version 1.1</span>

    </div>
  );
}
