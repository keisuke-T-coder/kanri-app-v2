"use client";

import { ClientId, CLIENT_TABS } from "../_types/schema";

interface ClientTabsProps {
  activeClient: ClientId;
  onChange: (id: ClientId) => void;
}

export function ClientTabs({ activeClient, onChange }: ClientTabsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar bg-white/50 border-b border-black/[0.03]">
      <div className="flex px-2 py-2">
        {CLIENT_TABS.map((tab) => {
          const isActive = activeClient === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-6 py-3 text-[11px] font-black transition-all whitespace-nowrap ${
                isActive 
                  ? "text-primary" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
