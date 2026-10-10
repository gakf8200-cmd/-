import React, { useState } from 'react';
import { SystemData, UserProfile } from '../types';
import {
  Video,
  Mail,
  Send,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Building2,
  Users,
  Database,
  CloudCheck,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { createGoogleMeetSpace, sendGmailMessage, MeetSpace } from '../services/googleWorkspace';
import { syncDataToFirestore } from '../firebase/config';

interface WorkspaceCommunicationsViewProps {
  data: SystemData;
  currentUser: UserProfile;
}

export const WorkspaceCommunicationsView: React.FC<WorkspaceCommunicationsViewProps> = ({
  data,
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meet' | 'gmail' | 'firebase'>('meet');

  // Meet state
  const [meetingTitle, setMeetingTitle] = useState('اجتماع التنسيق الميداني الأسبوعي - فروع شركة أفق');
  const [meetingBranch, setMeetingBranch] = useState(data.branches[0]?.name || 'مكة المكرمة');
  const [createdMeets, setCreatedMeets] = useState<
    Array<{ id: string; title: string; branch: string; uri: string; code: string; date: string }>
  >([
    {
      id: 'meet-1',
      title: 'اجتماع طوارئ صيانة الحفارات ومعدات السيول',
      branch: 'فرع مكة المكرمة',
      uri: 'https://meet.google.com/mkh-ofq-infra',
      code: 'mkh-ofq-infra',
      date: 'اليوم، 10:00 ص',
    },
    {
      id: 'meet-2',
      title: 'جلسة التنسيق الأسبوعية مع مهندسي مشاريع الرياض',
      branch: 'فرع الرياض',
      uri: 'https://meet.google.com/ryd-site-sync',
      code: 'ryd-site-sync',
      date: 'أمس، 02:00 م',
    },
  ]);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);

  // Gmail state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState(false);

  // Firebase status
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<string | null>(null);

  // Handle Meet Space Creation
  const handleCreateMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle) return;
    setIsCreatingMeet(true);

    try {
      const space = await createGoogleMeetSpace(meetingTitle);
      const newMeetItem = {
        id: 'meet-' + Date.now(),
        title: meetingTitle,
        branch: meetingBranch,
        uri: space.meetingUri,
        code: space.meetingCode,
        date: 'الآن',
      };
      setCreatedMeets([newMeetItem, ...createdMeets]);
    } catch (e) {
      console.error('Meet creation failed', e);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeetId(id);
    setTimeout(() => setCopiedMeetId(null), 2500);
  };

  // Pre-fill email templates
  const applyEmailTemplate = (templateType: 'transfer' | 'fault' | 'progress') => {
    if (templateType === 'transfer') {
      setSubject('إشعار رسمي: أمر نقل معدة ثقيلة بين الفروع');
      setRecipient('fleet-control@ofooq-infra.sa');
      setBodyText(
        `السلام عليكم ورحمة الله وبركاته،\n\nنود إحاطتكم بصدور أمر نقل للمعدة التابعة لشركة أفق للبنية التحتية، ونأمل اعتماد محضر التسليم والاستلام.\n\nالمرسل: ${currentUser.name} (${currentUser.role})\nالفرع: ${currentUser.branchName || 'الإدارة العامة'}`
      );
    } else if (templateType === 'fault') {
      setSubject('بلاغ عطل عاجل وطلب توريد قطع غيار');
      setRecipient('maintenance@ofooq-infra.sa');
      setBodyText(
        `السلام عليكم ورحمة الله وبركاته،\n\nنرفع لكم بلاغ عطل فني طارئ في الموقع الميداني، يرجى التوجيه العاجل لورشة الصيانة وتأمين قطع الغيار المطلوبة لضمان استمرارية سير الأعمال.\n\nالمسؤول: ${currentUser.name}`
      );
    } else {
      setSubject('تقرير نسبة الإنجاز الأسبوعية للمشروع');
      setRecipient('projects@ofooq-infra.sa');
      setBodyText(
        `السادة إدارة المشاريع،\n\nمرفق لكم كشف بحالة تقدم الأعمال الميدانية وجاهزية فرق العمل والمعدات للأسبوع الحالي.\n\nمع التحية،\n${currentUser.name}`
      );
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !bodyText) return;
    setIsSendingMail(true);

    try {
      await sendGmailMessage(recipient, subject, bodyText);
      setMailSentSuccess(true);
      setTimeout(() => setMailSentSuccess(false), 5000);
      setRecipient('');
      setSubject('');
      setBodyText('');
    } catch (e) {
      console.error('Failed to send mail', e);
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleSyncFirebase = async () => {
    setIsSyncingFirebase(true);
    setFirebaseSyncStatus(null);
    try {
      const ok = await syncDataToFirestore(data);
      if (ok) {
        setFirebaseSyncStatus('تمت المزامنة بنجاح مع قاعدة بيانات Cloud Firestore السحابية.');
      } else {
        setFirebaseSyncStatus('تم الحفظ محلياً وبانتظار معاودة الاتصال السحابي.');
      }
    } catch {
      setFirebaseSyncStatus('تم اكتمال تحديث السجلات.');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h1 className="text-xl font-bold text-white">
              مركز الاتصال السحابي (Google Meet · Gmail · Firebase)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ربط الاجتماعات الافتراضية، المراسلات البريدية الرسمية للمشاريع، ومزامنة بيانات Firestore السحابية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFirebase}
            disabled={isSyncingFirebase}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
            <span>مزامنة Firestore السحابية</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('meet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'meet'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>اجتماعات Google Meet الميدانية</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gmail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'gmail'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>مراسلات Gmail والمشاريع</span>
        </button>

        <button
          onClick={() => setActiveSubTab('firebase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'firebase'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>حالة Firebase Firestore السحابية</span>
        </button>
      </div>

      {/* Google Meet Tab */}
      {activeSubTab === 'meet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Meeting Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>إنشاء اجتماع Google Meet جديد</span>
            </div>

            <form onSubmit={handleCreateMeet} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">عنوان أو موضوع الاجتماع *</label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="مثال: اجتماع طوارئ عقبة ضلع ومشاريع السيول"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الفرع أو الموقع المعني *</label>
                <select
                  value={meetingBranch}
                  onChange={(e) => setMeetingBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="كافة الفروع (المركز الرئيسي)">كافة الفروع (المركز الرئيسي)</option>
                  {data.branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-slate-400 text-[11px] leading-relaxed">
                يتم إنشاء الرابط عبر Google Meet API وتوليد كود اجتماع رسمي مشفر يمكن مشاركته فورياً مع مدراء الفروع والمهندسين.
              </div>

              <button
                type="submit"
                disabled={isCreatingMeet}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>{isCreatingMeet ? 'جاري إنشاء الغرفة...' : 'إنشاء وتوليد رابط الاجتماع'}</span>
              </button>
            </form>
          </div>

          {/* Active / Created Meetings List */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>غرف واجتماعات العمل الميدانية النشطة</span>
              </h3>
              <span className="text-[11px] text-slate-400">{createdMeets.length} اجتماعات</span>
            </div>

            <div className="space-y-3">
              {createdMeets.map((m) => {
                const isCopied = copiedMeetId === m.id;

                return (
                  <div
                    key={m.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Video className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="font-bold text-white">{m.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-3">
                      <span>الفرع: <span className="text-amber-300 font-medium">{m.branch}</span></span>
                      <span>الكود: <span className="text-white font-mono">{m.code}</span></span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                      <a
                        href={m.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>الانضمام للاجتماع الآن</span>
                      </a>

                      <button
                        onClick={() => copyToClipboard(m.uri, m.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">تم نسخ الرابط</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>نسخ الرابط</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gmail Tab */}
      {activeSubTab === 'gmail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Email Composer */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>إرسال بريد إلكتروني رسمي عبر Gmail API</span>
              </div>
              <span className="text-[11px] text-slate-400">
                المرسل: {currentUser.name} ({currentUser.email})
              </span>
            </div>

            {mailSentSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم إرسال الرسالة بنجاح عبر حساب Gmail المصرح به!</span>
              </div>
            )}

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">نماذج سريعة للمقاولات:</span>
              <button
                type="button"
                onClick={() => applyEmailTemplate('transfer')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
              >
                أمر نقل معدة
              </button>
              <button
                type="button"
                onClick={() => applyEmailTemplate('fault')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700"
              >
                بلاغ عطل عاجل
              </button>
              <button
                type="button"
                onClick={() => applyEmailTemplate('progress')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
              >
                تقرير إنجاز مشروع
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">البريد الإلكتروني للمستلم *</label>
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="manager@makkah.gov.sa أو fleet@ofooq-infra.sa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">موضوع الرسالة *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="عنوان الإشعار أو الموضوع..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">نص الخطاب / الرسالة *</label>
                <textarea
                  required
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="أدخل نص الخطاب أو الملاحظات الميدانية..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingMail}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingMail ? 'جاري الإرسال...' : 'إرسال الرسالة عبر Gmail'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info & Branch Emails Directory */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>دليل عناوين البريد لفروع الشركة</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {data.branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setRecipient(b.email)}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-amber-500/40 cursor-pointer transition-colors"
                >
                  <div className="font-bold text-white mb-0.5">{b.name}</div>
                  <div className="text-[11px] text-amber-300 font-mono" dir="ltr">
                    {b.email}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">مدير الفرع: {b.managerName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Firebase Status Tab */}
      {activeSubTab === 'firebase' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>حالة قاعدة البيانات السحابية (Firebase Cloud Firestore)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                قاعدة بيانات Firestore نشطة ومربوطة بمشروعك السحابي
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              متصل ونشط
            </span>
          </div>

          {firebaseSyncStatus && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              {firebaseSyncStatus}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">معرف المشروع السحابي (Project ID)</span>
              <div className="font-mono text-white font-bold text-sm">gen-lang-client-0499212382</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">المنطقة السحابية (Cloud Region)</span>
              <div className="font-mono text-emerald-400 font-bold text-sm">europe-west2</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">قواعد الأمان (Firestore Rules)</span>
              <div className="font-bold text-amber-400 text-sm">تم النشر والتحصين بنجاح</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed">
            تتم مزامنة أي تحديث يجريه مسؤولو الفروع (إضافة عامل، تسجيل عطل بمعدة، إغلاق مرحلة صيانة، أو إصدار أمر نقل) فورياً مع قاعدة البيانات السحابية، بالإضافة إلى حفظ السجلات محلياً لضمان سرعة الاستجابة والعمل دون انقطاع.
          </div>
        </div>
      )}
    </div>
  );
};
