"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Reminder = {
  id: string;
  title: string;
  date: string;
  time: string;
  enabled: boolean;
};

export default function ReminderGlobalBar() {
  const [urgentCount, setUrgentCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkReminders = () => {
      try {
        const saved = localStorage.getItem('userReminders');
        if (!saved) {
          setUrgentCount(0);
          return;
        }

        const reminders: Reminder[] = JSON.parse(saved);
        const now = new Date();
        
        const urgent = reminders.filter(r => {
          if (!r.enabled) return false;
          const deadlineStr = `${r.date}T${r.time}`;
          const deadline = new Date(deadlineStr);
          if (isNaN(deadline.getTime())) return false;

          const diffMs = deadline.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          return diffHours <= 3; // 期限切れ（マイナス）になっても表示し続ける
        });

        setUrgentCount(urgent.length);
      } catch (e) {
        console.error("Reminder check error:", e);
      }
    };

    checkReminders();
    const timer = setInterval(checkReminders, 60000);
    return () => clearInterval(timer);
  }, []);

  if (urgentCount === 0) return null;

  return (
    <div 
      onClick={() => router.push('/report?modal=reminders')}
      className="sticky top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 px-4 shadow-lg flex items-center justify-center gap-3 cursor-pointer active:brightness-90 transition-all border-b border-white/10"
    >
      <span className="text-lg animate-bounce">⏰</span>
      <p className="text-[11px] md:text-sm font-black tracking-tight flex items-center gap-1.5">
        <span className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold">URGENT</span>
        期限間近・超過のタスクが {urgentCount} 件あります！確認してください
      </p>
      <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
      <svg className="w-4 h-4 opacity-70 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
    </div>
  );
}
