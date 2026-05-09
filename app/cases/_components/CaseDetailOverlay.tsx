"use client";

import { useState, useMemo } from "react";
import { ClientId, Status, CLIENT_TABS } from "../_types/schema";
import { ChevronLeft, ChevronRight, MapPin, User, FileText, CheckCircle2, History, Loader2, Mail, Check, Edit2, Save, X, Navigation, Home, Plus } from "lucide-react";
import { useCases } from "../_context/CasesContext";
import { CasePartsManager } from "./CasePartsManager";

const ASSIGNEES = [
  { name: "佐藤", symbol: "🈂️" },
  { name: "田中", symbol: "❤️" },
  { name: "南", symbol: "🃏" },
  { name: "新田", symbol: "♠️" },
  { name: "徳重", symbol: "♣️" }
];

interface CaseDetailOverlayProps {
  item: CaseItem;
  onClose: () => void;
}

export function CaseDetailOverlay({ item, onClose }: CaseDetailOverlayProps) {
  const { 
    allCases, loading, activeClient, statusFilter, symbolFilter, 
    updateCaseContent, updateCaseFields, setSelectedCase 
  } = useCases();
  
  const [updating, setUpdating] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContentText, setEditContentText] = useState("");
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editHeaderFields, setEditHeaderFields] = useState({
    propertyName: "",
    caseName: "",
    ownerName: "",
    address: ""
  });
  const [mailCopied, setMailCopied] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(ASSIGNEES[0]);
  const [quickInputText, setQuickInputText] = useState("");

  const { prevItem, nextItem } = useMemo(() => {
    const from = activeClient;
    const listAll = allCases[from as string] || [];
    
    let filteredList = listAll.filter(c => c.status === statusFilter);
    if (from === "priority") {
      if (symbolFilter === "ball") filteredList = filteredList.filter(c => c.title.includes("🥎"));
      if (symbolFilter === "circle") filteredList = filteredList.filter(c => c.title.includes("⭕️"));
      if (symbolFilter === "speaker") filteredList = filteredList.filter(c => c.title.includes("📢") || c.title.includes("📣"));
    }

    const currentIndex = filteredList.findIndex(c => c.clientId === item.clientId && c.rowNumber === item.rowNumber);

    return {
      prevItem: currentIndex > 0 ? filteredList[currentIndex - 1] : null,
      nextItem: currentIndex < filteredList.length - 1 && currentIndex !== -1 ? filteredList[currentIndex + 1] : null
    };
  }, [allCases, item.clientId, item.rowNumber, activeClient, statusFilter, symbolFilter]);

  const handleEditClick = () => {
    setEditContentText(item.content || "");
    setIsEditingContent(true);
  };

  const handleHeaderEditClick = () => {
    setEditHeaderFields({
      propertyName: item.propertyName || "",
      caseName: item.caseName || "",
      ownerName: item.ownerName || "",
      address: item.address || ""
    });
    setIsEditingHeader(true);
  };

  const handleContentSave = async () => {
    if (editContentText === item.content) {
      setIsEditingContent(false);
      return;
    }
    setUpdating(true);
    try {
      const sheetName = CLIENT_TABS.find(t => t.id === item.clientId)?.sheetName || "シート5";
      const res = await fetch("/api/cases-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateContent", sheetName, rowNumber: item.rowNumber, newContent: editContentText })
      });
      const json = await res.json();
      if (json.success) {
        updateCaseContent(item.clientId, item.rowNumber, editContentText);
        setIsEditingContent(false);
      } else { alert("更新に失敗しました: " + json.error); }
    } catch (err) { alert("通信エラーが発生しました"); } finally { setUpdating(false); }
  };

  const handleHeaderSave = async () => {
    setUpdating(true);
    try {
      const sheetName = CLIENT_TABS.find(t => t.id === item.clientId)?.sheetName || "シート5";
      const fieldsToUpdate: Record<string, string> = {};
      if (item.propertyName && editHeaderFields.propertyName !== item.propertyName) fieldsToUpdate["物件名"] = editHeaderFields.propertyName;
      if (item.caseName && editHeaderFields.caseName !== item.caseName) fieldsToUpdate["案件名"] = editHeaderFields.caseName;
      if (item.ownerName && editHeaderFields.ownerName !== item.ownerName) fieldsToUpdate["施主名"] = editHeaderFields.ownerName;
      if (editHeaderFields.address !== item.address) fieldsToUpdate["住所"] = editHeaderFields.address;

      if (Object.keys(fieldsToUpdate).length === 0) { setIsEditingHeader(false); setUpdating(false); return; }

      const res = await fetch("/api/cases-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateFields", sheetName, rowNumber: item.rowNumber, fields: fieldsToUpdate })
      });
      const json = await res.json();
      if (json.success) {
        updateCaseFields(item.clientId, item.rowNumber, {
          propertyName: editHeaderFields.propertyName,
          caseName: editHeaderFields.caseName,
          ownerName: editHeaderFields.ownerName,
          address: editHeaderFields.address
        });
        setIsEditingHeader(false);
      } else { alert("更新に失敗しました: " + json.error); }
    } catch (err) { alert("通信エラーが発生しました"); } finally { setUpdating(false); }
  };

  const handleToggleSymbol = async (symbol: string) => {
    if (!item) return;
    setUpdating(true);
    try {
      const sheetName = CLIENT_TABS.find(t => t.id === item.clientId)?.sheetName || "シート5";
      const fieldsToUpdate: Record<string, string> = {};
      const updatedValues: Record<string, string> = {};
      const toggleInString = (str: string) => {
        if (!str) return "";
        if (str.includes(symbol)) return str.replaceAll(symbol, "").trim();
        return symbol + str;
      };
      if (item.propertyName) { fieldsToUpdate["物件名"] = toggleInString(item.propertyName); updatedValues["propertyName"] = fieldsToUpdate["物件名"]; }
      if (item.caseName) { fieldsToUpdate["案件名"] = toggleInString(item.caseName); updatedValues["caseName"] = fieldsToUpdate["案件名"]; }
      if (item.ownerName) { fieldsToUpdate["施主名"] = toggleInString(item.ownerName); updatedValues["ownerName"] = fieldsToUpdate["施主名"]; }
      if (Object.keys(fieldsToUpdate).length === 0) return;

      const res = await fetch("/api/cases-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateFields", sheetName, rowNumber: item.rowNumber, fields: fieldsToUpdate })
      });
      const json = await res.json();
      if (json.success) { updateCaseFields(item.clientId, item.rowNumber, updatedValues); }
      else { alert("更新に失敗しました: " + json.error); }
    } catch (err) { alert("通信エラーが発生しました"); } finally { setUpdating(false); }
  };

  const handleMapsClick = () => {
    if (!item.address) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`, "_blank");
  };

  const generateReportEmail = () => {
    const now = new Date();
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const todayStr = `${now.getMonth() + 1}/${now.getDate()}(${days[now.getDay()]})`;
    const todayKey = `${now.getMonth() + 1}/${now.getDate()}`;
    const todayKeyFull = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;

    const combinedText = (item.content || "") + "\n" + (item.history || "");
    const lines = combinedText.split("\n");
    let entries: { date: string, content: string }[] = [];
    let currentEntry: { date: string, content: string } | null = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const dateMatch = line.match(/^[^\d]*(\d{1,2}\/\d{1,2})[>| ]/);
      if (dateMatch) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = { date: dateMatch[1], content: line.substring(line.search(/\d{1,2}\/\d{1,2}/) + dateMatch[1].length + 1).trim() };
      } else if (currentEntry) { currentEntry.content += (currentEntry.content ? "\n" : "") + line; }
    }
    if (currentEntry) entries.push(currentEntry);
    const stripSyms = (str: string) => str.replace(/[🥎⭕️📣📢]/g, "").trim();
    const todayEntry = entries.find(e => e.date === todayKey || e.date === todayKeyFull);
    const title = stripSyms(item.title || "");
    const address = stripSyms(item.address || "");
    const assignee = stripSyms(item.assignee || "");
    const workContent = stripSyms(todayEntry?.content || (entries.length > 0 ? entries[entries.length - 1].content : (item.content || "")));
    let photoUrl = (item.rawData?.["Googleフォト"] || item.rawData?.["URL"] || "").trim();
    if (!photoUrl) { const urlMatch = combinedText.match(/https:\/\/photos\.app\.goo\.gl\/[a-zA-Z0-9]+/); if (urlMatch) photoUrl = urlMatch[0]; }
    const emailText = `▪️様(担当 ${assignee})${item.status}\n住所:${address}\n物件名:${title}\n作業日時:${todayStr}\n作業内容:${workContent}\n作業状況:画像\n${photoUrl}\n`;
    navigator.clipboard.writeText(emailText);
    setMailCopied(true);
    setTimeout(() => setMailCopied(false), 2000);
    const recipient = "takeyoshi2008@hotmail.co.jp";
    const subject = `【報告】${title}様 (${item.status})`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailText)}`;
  };

  const handleQuickAppend = async () => {
    if (!quickInputText.trim() || !item) return;
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
    const appendText = `\n${selectedAssignee.symbol}${dateStr}> ${quickInputText.trim()}`;
    const newContent = (item.content || "") + appendText;
    setUpdating(true);
    try {
      const sheetName = CLIENT_TABS.find(t => t.id === item.clientId)?.sheetName || "シート5";
      const res = await fetch("/api/cases-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateContent", sheetName, rowNumber: item.rowNumber, newContent: newContent })
      });
      const json = await res.json();
      if (json.success) { updateCaseContent(item.clientId, item.rowNumber, newContent); setQuickInputText(""); }
      else { alert("追記に失敗しました: " + json.error); }
    } catch (err) { alert("通信エラーが発生しました"); } finally { setUpdating(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8f6f0] overflow-y-auto animate-in slide-in-from-right duration-300 no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-black/5 p-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-primary transition-colors bg-white/50 rounded-xl border border-black/5">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs font-black">一覧へ戻る</span>
        </button>
        <h1 className="ml-2 text-[13px] font-black text-slate-800 tracking-tight truncate flex-1 text-right">
          {item.title}様
        </h1>
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto w-full pb-20">
        {/* Header Section */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
          <div className="flex justify-between items-start">
            <div className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${
              item.status === "完了" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
            }`}>
              {item.status}
            </div>
            <div className="flex space-x-2">
              {!isEditingHeader ? (
                <button onClick={handleHeaderEditClick} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors shadow-sm bg-white/50 border border-black/5">
                  <Edit2 className="w-3 h-3" />
                </button>
              ) : (
                <div className="flex space-x-1">
                  <button onClick={handleHeaderSave} disabled={updating} className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors disabled:opacity-30">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsEditingHeader(false)} disabled={updating} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isEditingHeader ? (
            <div className="space-y-4 pt-2">
              {item.propertyName && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物件名</label>
                  <input type="text" value={editHeaderFields.propertyName} onChange={(e) => setEditHeaderFields(prev => ({ ...prev, propertyName: e.target.value }))} className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                </div>
              )}
              {item.caseName && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">案件名</label>
                  <input type="text" value={editHeaderFields.caseName} onChange={(e) => setEditHeaderFields(prev => ({ ...prev, caseName: e.target.value }))} className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                </div>
              )}
              {item.ownerName && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">施主名</label>
                  <input type="text" value={editHeaderFields.ownerName} onChange={(e) => setEditHeaderFields(prev => ({ ...prev, ownerName: e.target.value }))} className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">住所</label>
                <input type="text" value={editHeaderFields.address} onChange={(e) => setEditHeaderFields(prev => ({ ...prev, address: e.target.value }))} className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-900 leading-tight flex-1">{item.title}様</h2>
                <div className="flex bg-black/[0.03] p-1 rounded-2xl border border-black/[0.03]">
                  {["🥎", "⭕️", "📣", "📢"].map((sym) => {
                    const hasSym = item.title?.includes(sym);
                    return (
                      <button key={sym} onClick={() => handleToggleSymbol(sym)} disabled={updating} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${hasSym ? "bg-white shadow-sm border border-black/5" : "opacity-40"}`}>
                        <span className="text-xl">{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-start text-slate-500">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 flex-none opacity-40" />
                  <span className="text-sm font-bold leading-relaxed">{item.address || "住所情報なし"}</span>
                </div>
                {item.address && (
                  <div className="pl-7">
                    <button onClick={handleMapsClick} className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group active:scale-95">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center mr-3"><Navigation className="w-4 h-4 text-white" /></div>
                      <div className="text-left"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Navigation</div><div className="text-xs font-black text-slate-700">Googleマップ</div></div>
                    </button>
                  </div>
                )}
                <div className="flex items-center text-slate-500"><User className="w-4 h-4 mr-3 opacity-40" /><span className="text-sm font-bold">{item.assignee || "未割当"}</span></div>
              </div>
            </>
          )}
        </div>

        {/* Content & History & Append sections (Simplified representation, exactly same as original) */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400"><FileText className="w-4 h-4 mr-2 opacity-60" /><span className="text-xs font-bold uppercase tracking-widest">詳細</span></div>
            {!isEditingContent ? (<button onClick={handleEditClick} className="p-2 text-slate-600 bg-white/50 border border-black/5 rounded-full shadow-sm"><Edit2 className="w-4 h-4" /></button>) : (
              <div className="flex space-x-1">
                <button onClick={handleContentSave} disabled={updating} className="p-2 text-green-500">{updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}</button>
                <button onClick={() => setIsEditingContent(false)} disabled={updating} className="p-2 text-red-400"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          {isEditingContent ? (<textarea value={editContentText} onChange={(e) => setEditContentText(e.target.value)} className="w-full h-40 p-4 bg-white border border-slate-300 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />) : (<div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{item.content || "未登録"}</div>)}
        </div>

        {item.history && (<div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4"><div className="flex items-center text-slate-400"><History className="w-4 h-4 mr-2" /><span className="text-xs font-bold">対応履歴</span></div><div className="text-[13px] font-bold text-slate-600 leading-loose whitespace-pre-wrap bg-black/[0.02] p-4 rounded-2xl">{item.history}</div></div>)}
        
        {/* 部品管理セクション (NEW) */}
        <CasePartsManager item={item} />

        <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
          <div className="flex flex-wrap gap-1 justify-end">
            {ASSIGNEES.map((asg) => (<button key={asg.name} onClick={() => setSelectedAssignee(asg)} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedAssignee.name === asg.name ? "bg-primary text-white" : "bg-black/[0.03] text-slate-400"}`}>{asg.symbol} {asg.name}</button>))}
          </div>
          <div className="flex space-x-2">
            <input type="text" value={quickInputText} onChange={(e) => setQuickInputText(e.target.value)} placeholder="追記する内容を入力..." className="flex-1 p-4 bg-white border border-slate-400 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            <button onClick={handleQuickAppend} disabled={updating || !quickInputText.trim()} className="px-6 py-4 bg-slate-800 text-white rounded-2xl text-xs font-black">追記</button>
          </div>
        </div>

        <button onClick={generateReportEmail} className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-sm shadow-lg ${mailCopied ? "bg-green-500 text-white" : "bg-[#6366f1] text-white"}`}>
          {mailCopied ? <><Check className="w-5 h-5 mr-2" /> コピー完了</> : <><Mail className="w-5 h-5 mr-2" /> 完了報告メール作成</>}
        </button>
      </main>

      {/* Navigation Buttons (Floating) */}
      <div className="fixed inset-y-0 left-0 flex items-center p-2 z-[110] pointer-events-none">
        {prevItem && (
          <button onClick={() => setSelectedCase(prevItem)} className="p-3 glass rounded-full shadow-lg border border-black/5 text-slate-400 hover:text-primary transition-all pointer-events-auto active:scale-90">
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
      </div>
      <div className="fixed inset-y-0 right-0 flex items-center p-2 z-[110] pointer-events-none">
        {nextItem && (
          <button onClick={() => setSelectedCase(nextItem)} className="p-3 glass rounded-full shadow-lg border border-black/5 text-slate-400 hover:text-primary transition-all pointer-events-auto active:scale-90">
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      <style jsx>{` .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); } `}</style>
    </div>
  );
}
