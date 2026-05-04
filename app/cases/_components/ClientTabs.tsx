"use client";

import { CLIENT_TABS, ClientId } from "../_types/schema";

interface ClientTabsProps {
  activeClient: ClientId;
  onChange: (id: ClientId) => void;
}

export function ClientTabs({ activeClient, onChange }: ClientTabsProps) {
  return (
    <div className="flex w-full overflow-x-auto no-scrollbar glass sticky top-0 z-10 border-b border-black/5 shadow-sm">
      {CLIENT_TABS.map((tab) => {
        const isActive = activeClient === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-[80px] py-4 text-sm font-black transition-colors whitespace-nowrap px-4 border-b-2 ${
              isActive 
                ? "text-primary border-primary" 
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
