"use client";

import { CaseItem } from "../_types/schema";
import { MapPin, User, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CaseCardProps {
  item: CaseItem;
}

export function CaseCard({ item }: CaseCardProps) {
  return (
    <Link href={`/cases/detail/${item.clientId}/${item.rowNumber}`}>
      <div className="glass rounded-[24px] p-5 active:scale-[0.98] transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-primary transition-colors">
              {item.title}様
            </h3>
            <div className="flex items-center text-[10px] text-slate-400 mt-1 font-bold tracking-wider">
              <MapPin className="w-3 h-3 mr-1 opacity-50" />
              <span className="truncate max-w-[200px]">{item.address}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
            item.status === "完了" 
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          }`}>
            {item.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/[0.03] dark:border-white/5">
          <div className="flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5 mr-2 text-primary/60" />
            {item.assignee || "未割当"}
          </div>
          <div className="flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary/60" />
            {item.requestDate}
          </div>
        </div>
      </div>
    </Link>
  );
}
