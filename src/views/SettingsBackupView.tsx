import React, { useRef, useState } from 'react';
import { SystemData, UserProfile } from '../types';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  HardHat,
  Database,
  Trash2,
} from 'lucide-react';
import { SYSTEM_USERS } from '../utils/storage';
import { INITIAL_SYSTEM_DATA } from '../data/seedData';

interface SettingsBackupViewProps {
  data: SystemData;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  onRestoreData: (importedData: SystemData) => void;
  onResetData: () => void;
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  data,
  currentUser,
  onChangeUser,
  onRestoreData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDownloadBackup = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_شركة_أفق_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('تم تنزيل النسخة الاحتياطية بنجاح.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.branches && parsed.workers && parsed.equipment) {
          onRestoreData(parsed);
          setSuccessMessage('تم استرجاع قاعدة البيانات من النسخة الاحتياطية بنجاح.');
          setTimeout(() => setSuccessMessage(''), 4000);
        } else {
          alert('ملف النسخة الاحتياطية غير متوافق.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToClean = () => {
    if (
      confirm(
        'هل تريد استعادة البيانات الافتراضية للشركة (الفروع الخمسة والمعدات والعمال النموذجية)؟'
      )
    ) {
      onResetData();
      setSuccessMessage('تم إعادة تعيين بيانات النظام إلى التهيئة الأولية المعتمدة.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'تحذير: هل أنت متأكد من مسح كافة البيانات التجريبية لتجهيز النظام لاستقبال بيانات الشركة الحقيقية؟ سيتم الاحتفاظ فقط بهيكل الفروع الخمسة.'
      )
    ) {
      const cleanData: SystemData = {
        branches: INITIAL_SYSTEM_DATA.branches,
        projects: [],
        teams: [],
        workers: [],
        leaves: [],
        laborCases: [],
        equipment: [],
        maintenanceReports: [],
        spareParts: [],
        preventivePlans: [],
        auditLogs: [
          {
            id: 'log-clean-' + Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            userName: currentUser.name,
            userRole: currentUser.role,
            actionType: 'تعديل',
            entityType: 'فرع',
            description: 'تم مسح البيانات التجريبية وتهيئة النظام لإدخال بيانات شركة أفق الحقيقية',
          },
        ],
        notifications: [],
        equipmentTransfers: [],
        users: data.users || INITIAL_SYSTEM_DATA.users,
      };
      onRestoreData(cleanData);
      setSuccessMessage('تم تفريغ البيانات التجريبية بنجاح! المنظومة الآن جاهزة لإدخال بياناتكم الحقيقية.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">إعدادات الأمان والصلاحيات والنسخ الاحتياطي</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          إدارة أدوار المستخدمين (RBAC)، التبديل لاختبار الصلاحيات، النسخ الاحتياطي والاسترجاع
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* User Roles & Permissions Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>مستويات المستخدمين والصلاحيات المعتمدة (RBAC)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك التبديل بين الحسابات أدناه لتجربة الصلاحيات المقيدة لكل دور وفرع
            </p>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            الحالي: {currentUser.name} ({currentUser.role})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_USERS.map((usr) => {
            const isSelected = usr.id === currentUser.id;

            return (
              <div
                key={usr.id}
                onClick={() => onChangeUser(usr)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">{usr.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {usr.role}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>
                    النطاق: <span className="text-slate-200">{usr.branchName}</span>
                  </div>
                  <div>
                    البريد: <span className="font-mono text-slate-400">{usr.email}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-1.5 border-t border-amber-500/30 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أنت تعمل حالياً بهذه الصلاحية</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>النسخ الاحتياطي واسترجاع قاعدة البيانات الكاملة</span>
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          حفظ نسخة احتياطية مشفرة بملف JSON تشمل كافة الفروع، المشاريع، العمال، الأسطول، بلاغات الصيانة، وسجل العمليات
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download Backup */}
          <button
            onClick={handleDownloadBackup}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all text-right group flex flex-col justify-between"
          >
            <div>
              <Download className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">تنزيل نسخة احتياطية كاملة</div>
              <p className="text-[11px] text-slate-400 mt-1">
                تصدير كافة جداول النظام الحالية بملف JSON للحفظ الخارجي
              </p>
            </div>
            <span className="mt-3 text-[11px] text-amber-400 font-bold">تصدير الآن ←</span>
          </button>

          {/* Import Backup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all text-right group flex flex-col justify-between">
            <div>
              <Upload className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">استرجاع من نسخة احتياطية</div>
              <p className="text-[11px] text-slate-400 mt-1">
                رفع واستعادة ملف نسخة سابقة تم تنزيلها
              </p>
            </div>
            <label className="mt-3 text-[11px] text-sky-400 font-bold cursor-pointer inline-block">
              <span>اختر ملف النسخة ←</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset or Clean Data */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-all text-right group flex flex-col justify-between">
            <div>
              <RefreshCcw className="w-5 h-5 text-rose-400 mb-2 group-hover:rotate-180 transition-transform" />
              <div className="text-xs font-bold text-white">إعادة تعيين / تهيئة حقيقية</div>
              <p className="text-[11px] text-slate-400 mt-1">
                تفريغ البيانات التجريبية للبدء في استخدام بيانات الشركة الفعلية
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleResetToClean}
                className="text-[10px] text-amber-400 font-bold underline"
              >
                استعادة النموذجية
              </button>
              <button
                onClick={handleClearAllData}
                className="text-[10px] text-rose-400 font-bold underline"
              >
                مسح للتشغيل الفعلي
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Metadata Footer */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">شركة أفق البنية التحتية للمقاولات</span>
          <span>· سجل تجاري معتمد · المملكة العربية السعودية</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          الفروع المعتمدة: مكة المكرمة · الرياض · أبها · سبت العلايا · النماص
        </div>
      </div>
    </div>
  );
};
