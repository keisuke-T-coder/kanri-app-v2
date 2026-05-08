"use client";

import { InventoryProvider } from "./_context/InventoryContext";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="inventory-module min-h-screen bg-[#f8f6f0] font-sans">
      <InventoryProvider>
        {children}
      </InventoryProvider>

      <style jsx global>{`
        .inventory-module {
          --primary: #6366f1; /* 在庫管理用のテーマカラー */
          --background: #f8f6f0;
          --foreground: #1e293b;
          --card: #ffffff;
          --card-foreground: #1e293b;
          --border: rgba(0, 0, 0, 0.05);
          color: var(--foreground);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
