export type StockOperation = "使用" | "入荷" | "持出" | "返却";

export interface PartMaster {
  id: string;        // ID品名
  makerId: string;   // メーカーID
  makerName: string; // 表示用メーカー名
  initialStock: number;
  group: string;
  // 計算値
  currentStock: number;
  status: "適正" | "低在庫" | "欠品";
}

export type CaseType = "living" | "house" | "hidamari" | "total" | "takeyoshi" | "lts";

export interface StockHistory {
  rowNumber: number;
  createdAt: string;
  partId: string;    // ID品名
  operation: StockOperation;
  quantityChange: number;
  user: string;
  // 案件紐付け用ID列
  idLiving?: string;
  idHouse?: string;
  idHidamari?: string;
  idTotal?: string;
  idTakeyoshi?: string;
  idLts?: string;
}

export const MAKER_MAP: Record<string, string> = {
  "98d68e7e": "LIXIL",
  "f190f8e7": "KVK",
  "3e251ed1": "その他",
  "282b0d5c": "タカギ",
  "5a073250": "ホテル用部材",
  "fd5b8530": "DAIKO",
  "168ef058": "panasonic",
  "a1f86992": "TOTO",
  "76d121e4": "GIKEN",
  "480ddbc5": "コイズミ",
  "7b731be9": "前澤化成工業",
  "9483092c": "TV関連部材",
  "9eebbc9e": "SANEI",
  "44dcab66": "東芝",
  "b6511456": "カクダイ",
  "51df662c": "Janis",
  "21e1489b": "リンナイ",
  "d61cef53": "富士工業",
  "168c6df6": "消耗品"
};

export const MAKER_LIST = [
  "よく使う",
  "すべて",
  ...Object.values(MAKER_MAP)
];

// よく使う部品 (TOP 21)
export const TOP_21_PARTS = [
  "ゴム玉（大） TF-10R-L",
  "換気扇 FY-17C8",
  "ボールタップ V56-5X-13",
  "ダイヤフラム 50-1001-2",
  "シャワートイレ CW-D11/BN8",
  "インナータンク AT-1006",
  "給水ホース（1000mm）",
  "ゴムフロート 4643",
  "シャワーホース（1.6m） PZKF2SIL",
  "流し排水パッキン PP40-63-S",
  "RSF-542YA（キッチン水栓新品）",
  "AH42166L（コイズミ）",
  "FY-08PD9D 換気扇",
  "EEスイッチ EE441319",
  "カプラー付吸気弁 HBVK75S",
  "カプラーソケット A-4284-10",
  "シャワーヘッドセット（ホワイト） PS39-80X",
  "切替弁 Z695A",
  "シャワーセット PS39-CTA-WW",
  "ストレート止水栓 JV21JS-X2-13X350",
  "ドアノブラッチ本体（GIKEN）"
];

export const INVENTORY_SHEETS = {
  MASTER: "シート1",
  HISTORY: "シート2"
};
