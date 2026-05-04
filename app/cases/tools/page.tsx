"use client";

import { useState, useMemo } from "react";
import { Wrench, Calculator, Clipboard, Check, Search, AlertCircle, Trash2, X } from "lucide-react";
import { BottomNavigation } from "../_components/BottomNavigation";

// --- Databases ---
const MODELS_DB = {
  "JA1000": { label: "JA1000", parts: [
    { name: "レバーバルブセット", code: "JH9015JASV-05", type: "共通" },
    { name: "浄水器部(樹脂)", code: "JH030JA2GYE-02", type: "共通" },
    { name: "浄水器部(メッキ)", code: "JH030JA2ME-02", type: "共通" },
    { name: "ブレードホースセット", code: "JH9580HC", type: "共通" },
    { name: "ネジ式カプラ", code: "JH9100A-02", type: "共通" },
    { name: "フレキホース", code: "JH93010JA2N-02", type: "JA1000専用" },
  ]},
  "JH1000": { label: "JH1000", parts: [
    { name: "レバーバルブセット", code: "JH9015JASV-05", type: "共通" },
    { name: "浄水器部(樹脂)", code: "JH030JA2GYE-02", type: "共通" },
    { name: "浄水器部(メッキ)", code: "JH030JA2ME-02", type: "共通" },
    { name: "ブレードホースセット", code: "JH9580HC", type: "共通" },
    { name: "ネジ式カプラ", code: "JH9100A-02", type: "共通" },
    { name: "フレキホース", code: "JH93011JHN", type: "JH1000専用" },
  ]},
  "JA200": { label: "JA200", parts: [
    { name: "スパウトバルブセット", code: "JH9058C-04", type: "専用" },
    { name: "フレキホース(1000mm系)", code: "JH93010JA2N-02", type: "共通" },
    { name: "フレキホース(タンクレス)", code: "JH93009JAT-03", type: "共通" },
    { name: "浄水器部(樹脂)", code: "JH030JA2GYE-02", type: "共通" },
    { name: "浄水器部(メッキ)", code: "JH030JA2ME-02", type: "共通" },
    { name: "ブレードホースセット", code: "JH9580HC", type: "共通" },
    { name: "ネジ式カプラ", code: "JH9100A-02", type: "共通" },
  ]}
};

const PARTS_DB: Record<string, { name: string, price: number, laborCat: string | null }> = {
  "JH9015JASV-05": { name: "レバーバルブセット", price: 9000, laborCat: "レバーバルブ交換" },
  "JH93010JA2N-02": { name: "フレキホース(1000mm系)", price: 8000, laborCat: "フレキホース交換" },
  "JH93011JHN": { name: "フレキホース", price: 8000, laborCat: "フレキホース交換" },
  "JH93009JAT-03": { name: "フレキホース(タンクレス)", price: 7000, laborCat: "フレキホース交換" },
  "JH9058C-04": { name: "スパウトバルブセット", price: 7000, laborCat: "スパウトバルブ交換" },
  "JH030JA2GYE-02": { name: "浄水器部(樹脂)", price: 8500, laborCat: "浄水器部交換" },
  "JH030JA2ME-02": { name: "浄水器部(メッキ)", price: 9500, laborCat: "浄水器部交換" },
  "JH9580HC": { name: "ブレードホースセット", price: 4000, laborCat: "ブレードホース交換" },
  "JH9100A-02": { name: "ネジ式カプラ1個", price: 3000, laborCat: null },
};

const LABOR_PRICES: Record<string, number> = {
  "スパウトバルブ交換": 6500, "レバーバルブ交換": 5000, "ブレードホース交換": 5000, "フレキホース交換": 4500, "浄水器部交換": 3000,
};

export default function ToolsPage() {
  const [input, setInput] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const mode = useMemo(() => {
    const q = input.trim().toUpperCase();
    if (!q) return null;
    if (q in MODELS_DB) return "MODEL";
    if (q in PARTS_DB) return "PART";
    return "SEARCH";
  }, [input]);

  const addPart = (code: string) => { if (PARTS_DB[code]) setSelectedParts(prev => [...prev, code]); };
  const removePart = (index: number) => { setSelectedParts(prev => prev.filter((_, i) => i !== index)); };

  const estimate = useMemo(() => {
    if (selectedParts.length === 0) return null;
    let partsTotal = 0;
    const labors: { cat: string, price: number }[] = [];
    selectedParts.forEach(code => {
      const part = PARTS_DB[code];
      partsTotal += part.price;
      if (part.laborCat) labors.push({ cat: part.laborCat, price: LABOR_PRICES[part.laborCat] });
    });
    const hasSpout = labors.some(l => l.cat === "スパウトバルブ交換");
    const hasFlex = labors.some(l => l.cat === "フレキホース交換");
    if (hasSpout && hasFlex) labors.forEach(l => { if (l.cat === "フレキホース交換") l.price = 0; });
    const hasPurifier = labors.some(l => l.cat === "浄水器部交換");
    if (hasFlex && hasPurifier) labors.forEach(l => { if (l.cat === "浄水器部交換") l.price = 0; });
    labors.sort((a, b) => b.price - a.price);
    let laborTotal = 0;
    labors.forEach((l, idx) => { if (idx === 0) laborTotal += l.price; else if (l.price > 0) laborTotal += 500; });
    const baseFee = 3000;
    const total = baseFee + partsTotal + laborTotal;
    return { baseFee, partsTotal, laborTotal, total };
  }, [selectedParts]);

  const handleCopy = () => {
    if (!estimate) return;
    const partsText = selectedParts.map(code => `・${PARTS_DB[code].name}(${code}):${PARTS_DB[code].price.toLocaleString()}円`).join("\n");
    const text = `【見積明細】\n${partsText}\n基本料金:${estimate.baseFee.toLocaleString()}円\n部品代:${estimate.partsTotal.toLocaleString()}円\n技術料:${estimate.laborTotal.toLocaleString()}円\n合計:${estimate.total.toLocaleString()}円\n(税込:${Math.floor(estimate.total * 1.1).toLocaleString()}円)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f0] pb-32">
      <div className="sticky top-0 z-10 glass border-b border-black/5 p-4">
        <h1 className="text-lg font-black flex items-center text-slate-800">
          <Wrench className="w-5 h-5 mr-2 text-primary" />
          タカギ案件ツール
        </h1>
      </div>
      <main className="p-4 space-y-6 max-w-2xl mx-auto w-full">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">品番・機種検索</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input type="text" placeholder="例: JA1000, JH9015..." value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-white border border-black/5 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>
        {mode === "MODEL" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-xs font-bold text-slate-500 mb-3 px-1 flex items-center">機種合致: {MODELS_DB[input.toUpperCase() as keyof typeof MODELS_DB].label}</h2>
            <div className="grid gap-2">
              {MODELS_DB[input.toUpperCase() as keyof typeof MODELS_DB].parts.map((p, i) => (
                <button key={i} onClick={() => addPart(p.code)} className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5 hover:border-primary/30 text-left transition-all">
                  <div><div className="text-[11px] font-black text-slate-800">{p.name}</div><div className="text-[9px] text-slate-400 font-mono">{p.code}</div></div>
                  <span className="text-[9px] font-black bg-black/5 px-2 py-1 rounded text-slate-500">{p.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">選択中の部品 ({selectedParts.length})</h3>{selectedParts.length > 0 && (<button onClick={() => setSelectedParts([])} className="text-[10px] font-bold text-red-400 flex items-center"><Trash2 className="w-3 h-3 mr-1" />クリア</button>)}</div>
          {selectedParts.length === 0 ? (<div className="flex flex-col items-center justify-center py-10 bg-white/50 border-2 border-dashed border-black/5 rounded-3xl opacity-40"><Calculator className="w-8 h-8 mb-2" /><p className="text-[10px] font-bold uppercase">部品を追加すると見積もりが開始されます</p></div>) : (
            <div className="space-y-3">
              {selectedParts.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-black/5">
                  <div className="flex-1"><div className="text-[11px] font-black text-slate-800">{PARTS_DB[code].name}</div><div className="text-[9px] text-slate-400 font-mono">{code}</div></div>
                  <div className="text-right mr-3"><div className="text-xs font-bold text-slate-700">{PARTS_DB[code].price.toLocaleString()}円</div></div>
                  <button onClick={() => removePart(idx)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {estimate && (
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-primary/20 space-y-4 mt-6">
                  <div className="space-y-2 text-slate-500">
                    <div className="flex justify-between text-[11px] font-bold"><span>基本料金</span><span className="font-mono">{estimate.baseFee.toLocaleString()}円</span></div>
                    <div className="flex justify-between text-[11px] font-bold"><span>部品代合計</span><span className="font-mono">{estimate.partsTotal.toLocaleString()}円</span></div>
                    <div className="flex justify-between text-[11px] font-bold"><span>技術料合計</span><span className="font-mono">{estimate.laborTotal.toLocaleString()}円</span></div>
                    <div className="h-px bg-black/5 my-2" />
                    <div className="flex justify-between items-baseline"><span className="text-sm font-black text-slate-800">合計金額</span><span className="text-2xl font-black text-primary font-mono">{estimate.total.toLocaleString()}円</span></div>
                    <div className="text-right text-[10px] text-slate-400 font-bold">(税込 {Math.floor(estimate.total * 1.1).toLocaleString()}円)</div>
                  </div>
                  <button onClick={handleCopy} className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-sm transition-all duration-300 ${copied ? "bg-green-500 text-white" : "bg-slate-900 text-white"}`}>{copied ? (<><Check className="w-4 h-4 mr-2" /> コピー完了</>) : (<><Clipboard className="w-4 h-4 mr-2" /> 見積結果をコピー</>)}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation />
      <style jsx>{` .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); } `}</style>
    </div>
  );
}
