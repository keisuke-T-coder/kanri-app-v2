export type ClientId = "priority" | "living" | "hidamari" | "lts" | "takeyoshi" | "house";

export const CLIENT_TABS: { id: ClientId; label: string; sheetName: string }[] = [
  { id: "priority", label: "🔥最優先", sheetName: "" },
  { id: "living", label: "リビング", sheetName: "シート5" },
  { id: "hidamari", label: "ひだまり", sheetName: "シート6" },
  { id: "lts", label: "LTS依頼", sheetName: "シート13" },
  { id: "takeyoshi", label: "タケヨシ", sheetName: "シート16" },
  { id: "house", label: "ハウス", sheetName: "シート21" }
];

export type Status = "未完了" | "完了";

export interface CaseItem {
  id: string; // generated from rowNumber + clientId
  clientId: ClientId;
  rowNumber: number;
  
  // Common fields (unified)
  title: string; // 案件名 or 施主名 or 物件名
  address: string; // 住所
  assignee: string; // 対応者
  status: Status; // ステータス
  requestDate: string; // 依頼日
  
  // Detail fields
  content?: string; // 不具合内容 or 内容
  completionDate?: string; // 完了日
  
  // Specific to living and house
  history?: string; // 対応履歴
  
  // Raw data from GAS (useful for updates)
  rawData?: Record<string, any>;
}
