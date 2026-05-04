"use client";

import { CaseItem } from "../_types/schema";
import { MapPin, User, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CaseCardProps {
  item: CaseItem;
}

export function CaseCard({ item }: CaseCardProps) {
  const statusColor = item.status === "未完了" ? "bg-orange-500" : "bg-green-500";
  
  return (
    <Link 
      href={`/cases/detail/${item.clientId}/${item.rowNumber}`}
      className="block bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.02] hover:scale-[1.01] transition-all active:scale-95 group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg text-white shrink-0 ${statusColor}`}>
          {item.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-[11px] text-slate-500 font-bold">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
          <span className="truncate">{item.address}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/[0.03]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-[10px] text-slate-400 font-bold">
              <User className="w-3 h-3 mr-1" />
              {item.assignee || "未割当"}
            </div>
            <div className="flex items-center text-[10px] text-slate-400 font-bold">
              <Calendar className="w-3 h-3 mr-1" />
              {item.requestDate}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
