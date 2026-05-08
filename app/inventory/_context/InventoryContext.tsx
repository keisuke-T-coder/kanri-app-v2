"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PartMaster, StockHistory, INVENTORY_SHEETS, MAKER_MAP } from "../_types/schema";

interface InventoryContextType {
  parts: PartMaster[];
  histories: StockHistory[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  addHistory: (history: Partial<StockHistory>) => Promise<{ success: boolean; error?: string }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const CACHE_KEY = "inventory_data_cache_v1";

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [parts, setParts] = useState<PartMaster[]>([]);
  const [histories, setHistories] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 在庫計算ロジック
  const calculateInventory = useCallback((masterData: any[], historyData: any[]) => {
    // 履歴の処理
    const mappedHistories: StockHistory[] = historyData.map((row) => ({
      rowNumber: row.rowNumber,
      createdAt: row["作成日時"] || "",
      partId: row["ID品名"] || "",
      operation: row["操作"] || "使用",
      quantityChange: Number(row["数量の増減"] || 0),
      user: row["使用者"] || "",
      idLiving: row["IDリビング"],
      idHouse: row["IDハウス"],
      idHidamari: row["IDひだまり"],
      idTotal: row["IDトータル"]
    }));

    // マスターの処理と在庫計算
    const mappedParts: PartMaster[] = masterData.map((row) => {
      const partId = row["ID品名"] || "";
      const initialStock = Number(row["初期在庫"] || 0);
      const makerId = row["メーカー"] || "";

      // 履歴から計算 (使用はマイナス、入荷はプラス)
      const totalChange = mappedHistories
        .filter(h => h.partId === partId)
        .reduce((sum, h) => {
          if (h.operation === "使用") return sum - h.quantityChange;
          if (h.operation === "入荷") return sum + h.quantityChange;
          return sum; // 持出・返却は無視
        }, 0);

      const currentStock = initialStock + totalChange;

      return {
        id: partId,
        makerId: makerId,
        makerName: MAKER_MAP[makerId] || "その他",
        initialStock: initialStock,
        group: row["グループ"] || "",
        currentStock: currentStock,
        status: currentStock <= 0 ? "欠品" : (currentStock < initialStock * 0.2 ? "低在庫" : "適正")
      };
    });

    return { mappedParts, mappedHistories };
  }, []);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [masterRes, historyRes] = await Promise.all([
        fetch(`/api/gas?sheetName=${encodeURIComponent(INVENTORY_SHEETS.MASTER)}`),
        fetch(`/api/gas?sheetName=${encodeURIComponent(INVENTORY_SHEETS.HISTORY)}`)
      ]);

      const masterJson = await masterRes.json();
      const historyJson = await historyRes.json();

      if (masterJson.success && historyJson.success) {
        const { mappedParts, mappedHistories } = calculateInventory(masterJson.data, historyJson.data);
        
        setParts(mappedParts);
        setHistories(mappedHistories);
        
        // キャッシュに保存
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          parts: mappedParts,
          histories: mappedHistories,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateInventory]);

  // 履歴の追加
  const addHistory = async (history: Partial<StockHistory>) => {
    try {
      const res = await fetch("/api/gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addRow",
          sheetName: INVENTORY_SHEETS.HISTORY,
          rowData: {
            "作成日時": new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
            "ID品名": history.partId,
            "操作": history.operation,
            "数量の増減": history.quantityChange,
            "使用者": history.user
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        // 成功したらデータを再取得
        await fetchData(true);
        return { success: true };
      } else {
        return { success: false, error: json.error || "登録に失敗しました" };
      }
    } catch (error: any) {
      console.error("Failed to add history:", error);
      return { success: false, error: error.message };
    }
  };

  // 初回起動時: キャッシュを即表示し、裏で更新
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { parts: cachedParts, histories: cachedHistories } = JSON.parse(cached);
        setParts(cachedParts);
        setHistories(cachedHistories);
        setLoading(false);
        // 裏で最新化 (stale-while-revalidate)
        fetchData(true);
      } catch (e) {
        fetchData();
      }
    } else {
      fetchData();
    }
  }, [fetchData]);

  return (
    <InventoryContext.Provider value={{ 
      parts, 
      histories, 
      loading, 
      refreshing, 
      refresh: () => fetchData(false),
      addHistory
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
