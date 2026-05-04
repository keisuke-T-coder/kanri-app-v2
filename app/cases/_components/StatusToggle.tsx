"use client";

import { Status } from "../_types/schema";

interface StatusToggleProps {
  status: Status;
  onChange: (status: Status) => void;
}

export function StatusToggle({ status, onChange }: StatusToggleProps) {
  return (
    <div className="flex p-1 bg-black/[0.04] rounded-2xl w-full">
      <button
        onClick={() => onChange("未完了")}
        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${
          status === "未完了"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-slate-400 hover:text-slate-500"
        }`}
      >
        未完了
      </button>
      <button
        onClick={() => onChange("完了")}
        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${
          status === "完了"
            ? "bg-white text-green-600 shadow-sm"
            : "text-slate-400 hover:text-slate-500"
        }`}
      >
        完了
      </button>
    </div>
  );
}
