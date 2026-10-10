import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  Cpu,
  Check,
  Copy,
  AlertCircle,
  RefreshCw,
  Zap,
  Flame,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { SystemData, UserProfile } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  systemData: SystemData;
  currentUser: UserProfile;
  selectedBranchId: string;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  systemData,
  currentUser,
  selectedBranchId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'model',
      text: `مرحباً بك يا ${currentUser.name}! أنا المستشار التشغيلي الذكي لشركة أفق البنية التحتية للمقاولات ✦
أنا هنا لمساعدتك في تحليل جاهزية الأسطول والمعدات، ومتابعة بلاغات الصيانة ومراحلها العشر، وتوزيع الفرق الميدانية، ومراجعة شؤون العمالة والإقامات عبر فروعنا الخمسة (مكة، الرياض، أبها، سبت العلايا، النماص).

كيف يمكنني مساعدتك اليوم في تسيير العمليات؟`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Generate a live company summary to ground Gemini
  const generateSystemSummary = () => {
    const branchesNames = systemData.branches.map((b) => b.name).join(', ');
    const totalWorkers = systemData.workers.length;
    const workingWorkers = systemData.workers.filter((w) => w.status === 'على رأس العمل').length;
    const totalEquipment = systemData.equipment.length;
    const operatingEquip = systemData.equipment.filter((e) => e.status === 'تعمل').length;
    const maintenanceEquip = systemData.equipment.filter((e) => e.status === 'في الصيانة').length;
    const openTickets = systemData.maintenanceReports.filter((m) => m.status !== 'مكتمل').length;
    const openCases = systemData.laborCases.filter((c) => c.status !== 'تم حلها' && c.status !== 'مغلقة').length;

    return `
- الفروع الخمسة: ${branchesNames}
- إجمالي العمالة: ${totalWorkers} عامل (على رأس العمل: ${workingWorkers})
- إجمالي أسطول المعدات والآليات: ${totalEquipment} معدة (تعمل: ${operatingEquip}، تحت الصيانة: ${maintenanceEquip})
- بلاغات الصيانة المفتوحة حالياً: ${openTickets} بلاغ
- القضايا العمالية القائمة: ${openCases} قضية
- المستخدم الحالي: ${currentUser.name} (${currentUser.role}) - الفرع: ${currentUser.branchName || 'كافة الفروع'}
`;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isLoading) return;

    setErrorMessage('');
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const summary = generateSystemSummary();
      const payloadMessages = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          message: textToSend,
          model: selectedModel,
          systemSummary: summary,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'فشل في الاتصال بمحرك الذكاء الاصطناعي');
      }

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة الطلب.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('هل تريد مسح سجل المحادثة والبدء من جديد؟')) {
      setMessages([
        {
          id: 'welcome-msg-' + Date.now(),
          role: 'model',
          text: `تم بدء جلسة استشارية جديدة. كيف أستطيع مساعدة شركة أفق البنية التحتية وفروعها اليوم؟`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    }
  };

  const promptSuggestions = [
    'ما هي أفضل خطة لتوزيع المعدات بين فرعي مكة والرياض؟',
    'كيف نسرع إغلاق بلاغات الصيانة المتعثرة في المراحل العشر؟',
    'إجراءات التعامل مع انتهاء إقامات العمالة بدون غرامات',
    'توصيات لخفض تكاليف قطع الغيار والورش الخارجية',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
      {/* Top Bar: Model Selector, Role info, Clear history */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">مستشار أفق الذكي ✦ Gemini AI</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                متصل بالبيانات الميدانية الحية
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              استشارات تشغيلية وهندسية متقدمة لكافة الفروع والمشاريع والأسطول
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              title="اختر نموذج الذكاء الاصطناعي المناسب للمهمة"
            >
              <option value="gemini-3.5-flash" className="bg-slate-900 text-white">
                ⚡ gemini-3.5-flash (متوازن وذكي - الافتراضي)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">
                🚀 gemini-3.1-flash-lite (فائق السرعة)
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-white">
                🧠 gemini-3.1-pro-preview (تحليل متقدم)
              </option>
            </select>
          </div>

          {/* Reset / Clear Button */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            title="مسح سجل المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.role === 'model';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-right ${
                  isAi
                    ? 'bg-slate-950/90 border border-slate-800 text-slate-100 rounded-tr-none'
                    : 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tl-none shadow-amber-500/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10 text-[10px]">
                  <span className="font-bold opacity-80">
                    {isAi ? 'مستشار أفق الذكي' : currentUser.name}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-60 font-mono">
                    {msg.modelUsed && <span>[{msg.modelUsed}]</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Text Body with simple markdown whitespace formatting */}
                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px]">
                  {msg.text}
                </div>

                {isAi && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-[9px] text-amber-400/80">مدعوم ببيانات فروع شركة أفق</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-white flex items-center gap-1 text-[11px]"
                      title="نسخ الرد"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4 text-amber-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-xs justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 text-slate-300 rounded-2xl rounded-tr-none p-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
              <span className="text-xs text-slate-400">
                جارٍ تحليل العمليات وصياغة التوصيات عبر {selectedModel}...
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-850 overflow-x-auto flex gap-2">
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            disabled={isLoading}
            className="text-[11px] px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
          >
            ✦ {suggestion}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب استفسارك التشغيلي أو الهندسي هنا (مثال: كيف ننظم صيانة معدات فرع أبها؟)..."
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pr-4 pl-12 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all shrink-0"
            title="إرسال"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
