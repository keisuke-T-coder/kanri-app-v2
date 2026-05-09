"use client";

import React, { useState } from "react";
import { useInventory } from "../_context/InventoryContext";
import { PartMaster, StockOperation, CaseType } from "../_types/schema";
import { X, Package, Clock, Hash, CheckCircle2, AlertCircle, Minus, Plus, User, Search, Briefcase, Loader2, Trash2, MessageCircle, Share2, Copy, Check } from "lucide-react";
import { useCases, CaseItem } from "../../cases/_context/CasesContext";

interface PartDetailsProps {
  part: PartMaster;
  onClose: () => void;
}

export function PartDetails({ part, onClose }: PartDetailsProps) {
  const { histories, addHistory, deleteHistory } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // 案件紐付け用ステート
  const { allCases } = useCases();
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [selectedClient, setSelectedClient] = useState<CaseType | null>(null);

  const uncompletedCases = React.useMemo(() => {
    if (!selectedClient) return [];
    const clientCases = allCases[selectedClient] || [];
    return clientCases.filter(c => 
      c.status !== "完了" && 
      c.status !== "請求済み" &&
      c.status !== "完了（未請求）"
    );
  }, [allCases, selectedClient]);

  const CLIENTS: { id: CaseType, name: string }[] = [
    { id: "living", name: "リビング" },
    { id: "house", name: "ハウス" },
    { id: "hidamari", name: "ひだまり" },
    { id: "takeyoshi", name: "タケヨシ" },
    { id: "lts", name: "LTS" }
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getGroupColor = (group: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    ];
    if (!group) return "bg-slate-100 text-slate-500 border-slate-200";
    let hash = 0;
    for (let i = 0; i < group.length; i++) {
      hash = group.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getWorkerName = () => {
    return localStorage.getItem("selectedWorker") || localStorage.getItem("inventory_user_name") || "未設定";
  };

  // この部品に関連する履歴のみ抽出
  const relatedHistories = histories.filter(h => h.partId === part.id).slice(0, 5);

  const handleQuickAction = async (op: StockOperation) => {
    const userName = getWorkerName();
    
    setIsSubmitting(true);
    setMessage(null);

    const result = await addHistory({
      partId: part.id,
      operation: op,
      quantityChange: Number(quantity),
      user: userName,
      caseId: selectedCase?.id,
      caseType: selectedCase?.clientId as CaseType
    });

    if (result.success) {
      setMessage({ type: 'success', text: `${op}を登録しました` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || '登録に失敗しました' });
    }
    setIsSubmitting(false);
  };

  const generateOrderText = () => {
    return `🚨発注お願いします

--在庫分--
${part.id} × ${orderQuantity}

よろしくお願いいたします。`;
  };

  const handleShare = async () => {
    const text = generateOrderText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: text
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
      window.open(lineUrl, "_blank");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateOrderText());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDeleteHistory = async (rowNumber: number) => {
    if (!window.confirm("この履歴を削除してもよろしいですか？（在庫数に影響します）")) return;
    
    setDeletingId(rowNumber);
    const result = await deleteHistory(rowNumber);
    if (result.success) {
      setMessage({ type: 'success', text: '履歴を削除しました' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      alert(result.error || "削除に失敗しました");
    }
    setDeletingId(null);
  };

  const getLinkedCase = (h: any) => {
    const caseId = h.idLiving || h.idHouse || h.idHidamari || h.idTotal || h.idTakeyoshi || h.idLts;
    if (!caseId) return null;
    
    for (const clientId in allCases) {
      const found = allCases[clientId].find(c => c.id === caseId);
      if (found) {
        return {
          title: found.title || found.ownerName,
          clientName: CLIENTS.find(cl => cl.id === clientId)?.name || clientId
        };
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex gap-2 mb-1.5">
                <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-lg uppercase tracking-tighter shadow-sm">{part.makerName}</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border shadow-sm ${getGroupColor(part.group)}`}>{part.group || "未分類"}</span>
              </div>
              <h2 className="text-[20px] font-black text-slate-800 leading-tight">{part.id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Stats Grid - Extra Large */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-50 rounded-[32px] p-7 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">初期在庫</span>
              <span className="text-3xl font-black text-slate-600">{part.initialStock}</span>
            </div>
            <div className={`rounded-[32px] p-7 border ${
              part.currentStock <= 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
                part.currentStock <= 0 ? 'text-red-400' : 'text-blue-400'
              }`}>現在在庫</span>
              <span className={`text-5xl font-black leading-none ${
                part.currentStock <= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>{part.currentStock}</span>
            </div>
          </div>

          {/* Quick Registration - Rich UI */}
          <div className="space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">クイック在庫登録</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[12px] font-bold text-slate-600">{getWorkerName()}</span>
              </div>
            </div>

            {/* Case Linkage Section - 2 Step Selection */}
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" />
                  案件を紐付ける
                </span>
                {(selectedCase || selectedClient) && (
                  <button 
                    onClick={() => { setSelectedCase(null); setSelectedClient(null); }} 
                    className="text-[10px] font-black text-red-400 hover:text-red-500 underline"
                  >
                    リセット
                  </button>
                )}
              </div>

              {selectedCase ? (
                /* Selected Case Display */
                <div className="bg-white p-4 rounded-[24px] border-2 border-blue-100 shadow-sm flex items-center justify-between group animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-md self-start mb-1 uppercase tracking-tighter">
                      {CLIENTS.find(c => c.id === selectedCase.clientId)?.name}
                    </span>
                    <span className="text-[13px] font-black text-slate-700">{selectedCase.title || selectedCase.ownerName}</span>
                    <span className="text-[10px] font-bold text-slate-400">{selectedCase.propertyName}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
              ) : !selectedClient ? (
                /* Step 1: Client Selection */
                <div className="grid grid-cols-3 gap-2">
                  {CLIENTS.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className="py-3 px-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              ) : (
                /* Step 2: Uncompleted Case List */
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                      {CLIENTS.find(c => c.id === selectedClient)?.name}の未完了案件
                    </span>
                    <button onClick={() => setSelectedClient(null)} className="text-[10px] font-bold text-slate-400 underline">変更</button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                    {uncompletedCases.length === 0 ? (
                      <p className="text-center py-4 text-[11px] font-bold text-slate-300 bg-slate-50 rounded-xl italic">未完了案件はありません</p>
                    ) : (
                      uncompletedCases.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCase(c)}
                          className="w-full p-4 flex flex-col items-start bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left shadow-sm group"
                        >
                          <span className="text-[12px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {c.title || c.ownerName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1">{c.propertyName}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-8">
              {/* Rich Stepper */}
              <div className={`flex items-center gap-6 bg-white p-2 rounded-[28px] border-2 border-slate-100 shadow-inner transition-opacity ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                  disabled={isSubmitting}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-90"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">数量</span>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-16 text-center text-3xl font-black text-slate-800 bg-transparent focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                  disabled={isSubmitting}
                  className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-2xl text-white transition-all active:scale-90 shadow-lg shadow-blue-100"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full relative">
                {(["使用", "入荷", "持出", "返却"] as StockOperation[]).map(op => (
                  <button
                    key={op}
                    onClick={() => handleQuickAction(op)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center justify-center gap-1 py-5 rounded-[24px] text-[14px] font-black transition-all active:scale-95 border-2 ${
                      op === '使用' ? 'bg-white hover:bg-red-50 text-red-500 border-slate-100 hover:border-red-100' :
                      op === '入荷' ? 'bg-white hover:bg-green-50 text-green-500 border-slate-100 hover:border-green-100' :
                      op === '持出' ? 'bg-white hover:bg-blue-50 text-blue-500 border-slate-100 hover:border-blue-100' :
                      'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{op}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {op === '使用' ? '出庫する' : op === '入荷' ? '入庫する' : op === '持出' ? '現場へ' : '戻す'}
                    </span>
                  </button>
                ))}

                {/* Loading Overlay for the actions area */}
                {isSubmitting && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[32px] animate-in fade-in duration-200">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">データ反映中...</span>
                  </div>
                )}
              </div>

              {/* Parts Order Button */}
              <button 
                onClick={() => setIsOrderOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>部品発注依頼 (LINE共有)</span>
              </button>
            </div>

            {message && (
              <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span className="text-sm font-black">{message.text}</span>
              </div>
            )}
          </div>

          {/* Recent History for this Part */}
          <div className="space-y-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">この部品の最近の履歴</span>
            <div className="space-y-2">
              {relatedHistories.length === 0 ? (
                <p className="text-center py-6 text-slate-300 text-sm font-bold">履歴がありません</p>
              ) : (
                relatedHistories.map((h, i) => {
                  const linkedCase = getLinkedCase(h);
                  const isDeleting = deletingId === h.rowNumber;
                  
                  return (
                    <div key={i} className={`group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all ${isDeleting ? 'opacity-50 grayscale scale-95' : ''}`}>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            h.operation === '使用' ? 'bg-red-50 text-red-500 border-red-100' :
                            h.operation === '入荷' ? 'bg-green-50 text-green-500 border-green-100' :
                            'bg-white text-slate-400'
                          }`}>{h.operation}</span>
                          <span className="text-[11px] font-bold text-slate-400">{formatDate(h.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-slate-600 truncate">{h.user}</span>
                          {linkedCase && (
                            <span className="text-[10px] font-black text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 truncate max-w-[250px]">
                              <Briefcase className="w-2.5 h-2.5 flex-shrink-0" />
                              {linkedCase.clientName}: {linkedCase.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`text-sm font-black whitespace-nowrap ${
                          h.operation === '使用' ? 'text-red-500' : h.operation === '入荷' ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {h.operation === '使用' ? '-' : h.operation === '入荷' ? '+' : ''}{h.quantityChange}
                        </span>
                        <button 
                          onClick={() => handleDeleteHistory(h.rowNumber)}
                          disabled={isDeleting}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Padding */}
        <div className="h-10"></div>
      </div>

      {/* Parts Order Modal */}
      {isOrderOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl border border-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#f8f6f0]/50">
              <h3 className="text-sm font-black text-slate-800">部品発注依頼</h3>
              <button onClick={() => setIsOrderOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quantity Stepper */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">発注数量</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-3xl p-2">
                  <button 
                    onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 rounded-2xl shadow-sm active:scale-90 transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-black text-slate-800">{orderQuantity}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">個</span>
                  </div>
                  <button 
                    onClick={() => setOrderQuantity(prev => prev + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">送信内容の確認</label>
                <div className="bg-slate-900 rounded-3xl p-5 text-xs font-bold text-slate-300 leading-relaxed whitespace-pre-wrap relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  {generateOrderText()}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCopy}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-[28px] border-2 transition-all active:scale-95 ${
                    copyFeedback ? "border-green-500 bg-green-50 text-green-600" : "border-slate-100 bg-white text-slate-600"
                  }`}
                >
                  {copyFeedback ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  <span className="text-[10px] font-black">{copyFeedback ? "コピー完了" : "文章をコピー"}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-[28px] shadow-xl shadow-blue-100 active:scale-95 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] font-black">LINEで共有</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
