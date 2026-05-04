"use client";

import { Status } from "../_types/schema";

interface StatusToggleProps {
  status: Status;
  onChange: (status: Status) => void;
}

export function StatusToggle({ status, onChange }: StatusToggleProps) {
  return (
    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-full">
      <button
        onClick={() => onChange("未完了")}
        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
          status === "未完了"
            ? "bg-white dark:bg-[#1e293b] text-primary shadow-sm"
            : "text-slate-400"
        }`}
      >
        未完了
      </button>
      <button
        onClick={() => onChange("完了")}
        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
          status === "完了"
            ? "bg-white dark:bg-[#1e293b] text-primary shadow-sm"
            : "text-slate-400"
        }`}
      >
        完了
      </button>
    </div>
  );
}
