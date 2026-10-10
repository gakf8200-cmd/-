import React from 'react';
import {
  X,
  UserPlus,
  Truck,
  Wrench,
  CalendarPlus,
  Scale,
  ArrowRightLeft,
  HardHat,
  FileSpreadsheet,
  Layers,
  Building2,
} from 'lucide-react';
import { TabId } from './Sidebar';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction: (actionType: string) => void;
  onNavigateTab: (tab: TabId) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'add-worker',
      title: 'إضافة عامل جديد',
      desc: 'تسجيل عامل، المهنة، الإقامة، وتحديد الكفالة والفرع',
      icon: UserPlus,
      color: 'amber',
      tab: 'workers' as TabId,
    },
    {
      id: 'add-equipment',
      title: 'إضافة معدة / آلية',
      desc: 'إدخال رقم المعدة، الماركة، الموديل وتعيين المشغل والموقع',
      icon: Truck,
      color: 'sky',
      tab: 'equipment' as TabId,
    },
    {
      id: 'report-fault',
      title: 'تسجيل بلاغ عطل فني',
      desc: 'فتح بلاغ صيانة عاجل وتوثيق نوع العطل والأولوية',
      icon: Wrench,
      color: 'rose',
      tab: 'maintenance' as TabId,
    },
    {
      id: 'transfer-equipment',
      title: 'نقل معدة بين الفروع',
      desc: 'إصدار أمر نقل مع محضر الاستلام وتحديث السجل الزمني',
      icon: ArrowRightLeft,
      color: 'indigo',
      tab: 'transfers' as TabId,
    },
    {
      id: 'transfer-worker',
      title: 'نقل عامل بين الفرق والفروع',
      desc: 'مناقلة العامل مع الاحتفاظ بكامل السجل التاريخي',
      icon: ArrowRightLeft,
      color: 'purple',
      tab: 'transfers' as TabId,
    },
    {
      id: 'add-leave',
      title: 'تسجيل إجازة عامل',
      desc: 'إدخال مدة الإجازة والبدء وتفعيل تنبيه موعد العودة',
      icon: CalendarPlus,
      color: 'emerald',
      tab: 'leaves' as TabId,
    },
    {
      id: 'add-case',
      title: 'إضافة قضية / مشكلة عمالية',
      desc: 'توثيق شكوى، إصابة عمل، أو إجراء في مكتب العمل',
      icon: Scale,
      color: 'rose',
      tab: 'labor-cases' as TabId,
    },
    {
      id: 'add-preventive',
      title: 'جدولة صيانة وقائية',
      desc: 'تحديد موعد صيانة دورية حسب ساعات التشغيل والفلاتر',
      icon: HardHat,
      color: 'amber',
      tab: 'preventive' as TabId,
    },
    {
      id: 'add-team',
      title: 'إضافة فريق ميداني',
      desc: 'تأسيس فريق عمل، تحديد المشرف ونوع الأعمال والمشروع',
      icon: Layers,
      color: 'cyan',
      tab: 'teams' as TabId,
    },
    {
      id: 'view-reports',
      title: 'التقارير وتصدير Excel / PDF',
      desc: 'إحصائيات تكاليف الصيانة، جاهزية الأسطول وكشوفات العمال',
      icon: FileSpreadsheet,
      color: 'emerald',
      tab: 'reports' as TabId,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              الإجراءات والعمليات السريعة للمنظومة
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              اختر الإجراء المطلوب للتسجيل المباشر وتحديث بيانات الفروع والأسطول
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onTriggerAction(act.id);
                  onNavigateTab(act.tab);
                  onClose();
                }}
                className="text-right p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {act.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-center text-[11px] text-slate-500">
          شركة أفق البنية التحتية للمقاولات · تسجيل فوري موحد
        </div>
      </div>
    </div>
  );
};
