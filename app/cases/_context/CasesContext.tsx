"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { CaseItem, CLIENT_TABS, Status, ClientId } from "../_types/schema";

type SymbolFilter = "all" | "ball" | "circle" | "speaker";

interface CasesContextType {
  allCases: Record<string, CaseItem[]>;
  loading: boolean;
  error: string | null;
  updateCaseStatus: (clientId: string, rowNumber: number, newStatus: Status, completionDate: string) => void;
  updateCaseContent: (clientId: string, rowNumber: number, newContent: string) => void;
  updateCaseFields: (clientId: string, rowNumber: number, fields: Record<string, string>) => void;
  activeClient: ClientId;
  setActiveClient: (id: ClientId) => void;
  statusFilter: Status;
  setStatusFilter: (status: Status) => void;
  symbolFilter: SymbolFilter;
  setSymbolFilter: (filter: SymbolFilter) => void;
  refreshAll: () => Promise<void>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [allCases, setAllCases] = useState<Record<string, CaseItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeClient, setActiveClient] = useState<ClientId>("priority");
  const [statusFilter, setStatusFilter] = useState<Status>("未完了");
  const [symbolFilter, setSymbolFilter] = useState<SymbolFilter>("ball");
  const fetchedRef = useRef(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = CLIENT_TABS.filter(t => t.id !== "priority").map(async (tab) => {
        // V2用に /api/cases-gas を使用
        const res = await fetch(`/api/cases-gas?sheetName=${encodeURIComponent(tab.sheetName)}`);
        if (!res.ok) throw new Error("Failed to fetch " + tab.label);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "API returned false success");

        const mapped: CaseItem[] = json.data.map((row: any) => ({
          id: `${tab.id}-${row.rowNumber}`,
          clientId: tab.id,
          rowNumber: row.rowNumber,
          title: row["案件名"] || row["施主名"] || row["物件名"] || "",
          propertyName: row["物件名"] || "",
          caseName: row["案件名"] || "",
          ownerName: row["施主名"] || "",
          address: row["住所"] || "",
          assignee: row["対応者"] || "",
          status: row["ステータス"] as Status || "未完了",
          requestDate: formatDate(row["依頼日"]),
          content: row["不具合内容"] || row["内容"] || "",
          completionDate: formatDate(row["完了日"]),
          history: row["対応履歴"] || "",
          rawData: row,
        })).filter((item: CaseItem) => item.title.trim() !== "");

        return { id: tab.id, data: mapped.reverse() };
      });

      const results = await Promise.all(promises);
      const newAllCases: Record<string, CaseItem[]> = {};
      results.forEach(res => {
        newAllCases[res.id] = res.data;
      });

      // 最優先タブのデータを生成 (🥎, ⭕️, 📢, 📣 がタイトルに含まれるものを全シートから集約)
      const prioritySymbols = ["🥎", "⭕️", "📢", "📣"];
      const allItems = Object.values(newAllCases).flat();
      newAllCases["priority"] = allItems.filter(item => 
        prioritySymbols.some(sym => item.title.includes(sym))
      ).sort((a, b) => b.requestDate.localeCompare(a.requestDate)); // 日付の新しい順
      
      setAllCases(newAllCases);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAllData();
    }
  }, [fetchAllData]);

  const updateCaseStatus = useCallback((clientId: string, rowNumber: number, newStatus: Status, completionDate: string) => {
    setAllCases(prev => {
      const clientCases = prev[clientId] || [];
      const newClientCases = clientCases.map(c => {
        if (c.rowNumber === rowNumber) {
          return { ...c, status: newStatus, completionDate };
        }
        return c;
      });
      return { ...prev, [clientId]: newClientCases };
    });
  }, []);

  const updateCaseContent = useCallback((clientId: string, rowNumber: number, newContent: string) => {
    setAllCases(prev => {
      const clientCases = prev[clientId] || [];
      const newClientCases = clientCases.map(c => {
        if (c.rowNumber === rowNumber) {
          return { ...c, content: newContent };
        }
        return c;
      });
      return { ...prev, [clientId]: newClientCases };
    });
  }, []);

  const updateCaseFields = useCallback((clientId: string, rowNumber: number, fields: Record<string, string>) => {
    setAllCases(prev => {
      const clientCases = prev[clientId] || [];
      const newClientCases = clientCases.map(c => {
        if (c.rowNumber === rowNumber) {
          const updated = { ...c, ...fields };
          // titleも更新する (物件名/案件名/施主名のいずれかが変わった場合)
          const newTitle = 
            updated.caseName || 
            updated.ownerName || 
            updated.propertyName || 
            c.title;
          return { ...updated, title: newTitle };
        }
        return c;
      });
      return { ...prev, [clientId]: newClientCases };
    });
  }, []);

  return (
    <CasesContext.Provider value={{ 
      allCases, loading, error, 
      activeClient, setActiveClient, 
      statusFilter, setStatusFilter,
      symbolFilter, setSymbolFilter,
      updateCaseStatus, updateCaseContent, updateCaseFields, 
      refreshAll: fetchAllData 
    }}>
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (context === undefined) {
    throw new Error("useCases must be used within a CasesProvider");
  }
  return context;
}
