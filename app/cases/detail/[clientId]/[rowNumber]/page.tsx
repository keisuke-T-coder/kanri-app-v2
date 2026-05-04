"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientId, Status, CLIENT_TABS } from "../../../_types/schema";
import { ChevronLeft, MapPin, User, Calendar, FileText, CheckCircle2, History, Loader2, Mail, Check, Edit2, Save, X } from "lucide-react";
import { useCases } from "../../../_context/CasesContext";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { clientId, rowNumber } = params;
  const { allCases, loading, updateCaseContent } = useCases();
  
  const [updating, setUpdating] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContentText, setEditContentText] = useState("");
  const [mailCopied, setMailCopied] = useState(false);

  const item = useMemo(() => {
    const list = allCases[clientId as string] || [];
    return list.find(c => c.rowNumber === Number(rowNumber));
  }, [allCases, clientId, rowNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-30" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-10 text-center min-h-screen bg-[#f8f6f0]">
        <p className="text-sm font-bold opacity-30">案件が見つかりませんでした</p>
        <button onClick={() => router.back()} className="mt-4 text-primary font-bold">戻る</button>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditContentText(item.content || "");
    setIsEditingContent(true);
  };

  const handleContentSave = async () => {
    if (editContentText === item.content) {
      setIsEditingContent(false);
      return;
    }

    setUpdating(true);
    try {
      const sheetName = CLIENT_TABS.find(t => t.id === clientId)?.sheetName || "シート5";
      const res = await fetch("/api/cases-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateContent",
          sheetName,
          rowNumber: item.rowNumber,
          newContent: editContentText
        })
      });
      const json = await res.json();
      if (json.success) {
        updateCaseContent(clientId as string, item.rowNumber, editContentText);
        setIsEditingContent(false);
      } else {
        alert("更新に失敗しました: " + json.error);
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    } finally {
      setUpdating(false);
    }
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
        currentEntry = {
          date: dateMatch[1],
          content: line.substring(line.search(/\d{1,2}\/\d{1,2}/) + dateMatch[1].length + 1).trim()
        };
      } else if (currentEntry) {
        currentEntry.content += (currentEntry.content ? "\n" : "") + line;
      }
    }
    if (currentEntry) entries.push(currentEntry);

    let workContent = "";
    const todayEntry = entries.find(e => e.date === todayKey || e.date === todayKeyFull);
    if (todayEntry) workContent = todayEntry.content;
    else if (entries.length > 0) workContent = entries[entries.length - 1].content;
    else workContent = item.content || "";

    let photoUrl = (item.rawData?.["Googleフォト"] || item.rawData?.["URL"] || "").trim();
    if (!photoUrl) {
      const urlMatch = combinedText.match(/https:\/\/photos\.app\.goo\.gl\/[a-zA-Z0-9]+/);
      if (urlMatch) photoUrl = urlMatch[0];
    }

    const title = (item.title || "").replace(/\s/g, "");
    const address = (item.address || "").replace(/\s/g, "");
    const assignee = (item.assignee || "").replace(/\s/g, "");
    
    const emailText = `▪️${title}様(担当 ${assignee})${item.status}

住所:${address}

物件名:${title}

作業日時:${todayStr}

作業内容:${workContent}

作業状況:画像
${photoUrl}
`;

    navigator.clipboard.writeText(emailText);
    setMailCopied(true);
    setTimeout(() => setMailCopied(false), 2000);

    const recipient = "takeyoshi2008@hotmail.co.jp";
    const subject = `【報告】${title}様 (${item.status})`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailText)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f0] pb-10">
      <div className="sticky top-0 z-10 glass border-b border-black/5 p-4 flex items-center">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-base font-black text-slate-800 tracking-tight truncate flex-1">
          {item.title}様 詳細
        </h1>
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
          <div className="flex justify-between items-start">
            <div className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${
              item.status === "完了" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
            }`}>
              {item.status}
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{item.title}様</h2>
          
          <div className="space-y-3 pt-2">
            <div className="flex items-start text-slate-500">
              <MapPin className="w-4 h-4 mr-3 mt-0.5 flex-none opacity-40" />
              <span className="text-sm font-bold leading-relaxed">{item.address || "住所情報なし"}</span>
            </div>
            <div className="flex items-center text-slate-500">
              <User className="w-4 h-4 mr-3 flex-none opacity-40" />
              <span className="text-sm font-bold">{item.assignee || "未割当"}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400">
              <FileText className="w-4 h-4 mr-2 opacity-60" />
              <span className="text-xs font-bold uppercase tracking-widest">不具合内容・詳細</span>
            </div>
            {!isEditingContent ? (
              <button onClick={handleEditClick} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors shadow-sm bg-white/50 border border-black/5">
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-1">
                <button onClick={handleContentSave} disabled={updating} className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors disabled:opacity-30">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsEditingContent(false)} disabled={updating} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isEditingContent ? (
            <textarea
              value={editContentText}
              onChange={(e) => setEditContentText(e.target.value)}
              className="w-full h-40 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold leading-relaxed outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all text-slate-800 shadow-inner"
              placeholder="内容を入力してください..."
            />
          ) : (
            <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap py-2">
              {item.content || "内容が登録されていません。"}
            </div>
          )}
        </div>

        {/* History Section */}
        {(clientId === "living" || clientId === "house" || clientId === "takeyoshi") && item.history && (
          <div className="glass rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
            <div className="flex items-center text-slate-400 mb-4">
              <History className="w-4 h-4 mr-2 opacity-60" />
              <span className="text-xs font-bold uppercase tracking-widest">対応履歴</span>
            </div>
            <div className="text-[13px] font-bold text-slate-600 leading-loose whitespace-pre-wrap bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03]">
              {item.history}
            </div>
          </div>
        )}

        {/* Email Report Button */}
        <div className="pt-2">
          <button
            onClick={generateReportEmail}
            className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg active:scale-95 ${
              mailCopied ? "bg-green-500 text-white" : "bg-[#6366f1] text-white"
            }`}
          >
            {mailCopied ? (
              <><Check className="w-5 h-5 mr-2" /> 報告メールをコピーしました</>
            ) : (
              <><Mail className="w-5 h-5 mr-2" /> 完了報告メールを作成</>
            )}
          </button>
        </div>
      </main>

      <style jsx>{`
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
}
