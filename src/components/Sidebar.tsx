import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  HardHat,
  Wrench,
  AlertTriangle,
  CalendarCheck,
  Briefcase,
  History,
  Truck,
  Package,
  Layers,
  FileSpreadsheet,
  Activity,
  MapPin,
  ClipboardList,
  DollarSign,
  Settings,
  X,
  Scale,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

export type TabId =
  | 'dashboard'
  | 'gemini-chat'
  | 'central-overview'
  | 'map'
  | 'branches'
  | 'projects'
  | 'teams'
  | 'workers'
  | 'leaves'
  | 'labor-cases'
  | 'equipment'
  | 'equipment-history'
  | 'maintenance'
  | 'spare-parts'
  | 'preventive'
  | 'costs'
  | 'transfers'
  | 'reports'
  | 'audit-log'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogout?: () => void;
  statsCounts: {
    maintenanceCount: number;
    casesCount: number;
    leavesExpiringCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  currentUser,
  onLogout,
  statsCounts,
}) => {
  const navSections = [
    {
      group: 'الرئيسية والمتابعة المركزية',
      items: [
        { id: 'dashboard', label: 'لوحة التحكم الشاملة', icon: LayoutDashboard },
        { id: 'gemini-chat', label: 'مستشار أفق الذكي ✦ AI', icon: Sparkles },
        { id: 'central-overview', label: 'متابعة الإدارة المركزية', icon: Activity },
        { id: 'map', label: 'الخريطة الجغرافية', icon: MapPin },
        { id: 'branches', label: 'إدارة الفروع (5)', icon: Building2 },
        { id: 'projects', label: 'المشاريع ومواقع العمل', icon: Briefcase },
        { id: 'teams', label: 'الفرق الميدانية', icon: Layers },
      ],
    },
    {
      group: 'شؤون العمالة والموظفين',
      items: [
        { id: 'workers', label: 'قاعدة بيانات العمالة', icon: Users },
        {
          id: 'leaves',
          label: 'إجازات العمال',
          icon: CalendarCheck,
          badge: statsCounts.leavesExpiringCount > 0 ? statsCounts.leavesExpiringCount : undefined,
          badgeColor: 'amber',
        },
        {
          id: 'labor-cases',
          label: 'المشاكل والقضايا العمالية',
          icon: Scale,
          badge: statsCounts.casesCount > 0 ? statsCounts.casesCount : undefined,
          badgeColor: 'rose',
        },
      ],
    },
    {
      group: 'المعدات والصيانة والأسطول',
      items: [
        { id: 'equipment', label: 'إدارة المعدات والآليات', icon: Truck },
        { id: 'equipment-history', label: 'السجل التاريخي للمعدة', icon: History },
        {
          id: 'maintenance',
          label: 'بلاغات الأعطال ومراحل الإصلاح',
          icon: Wrench,
          badge: statsCounts.maintenanceCount > 0 ? statsCounts.maintenanceCount : undefined,
          badgeColor: 'rose',
        },
        { id: 'spare-parts', label: 'قطع الغيار والمستودع', icon: Package },
        { id: 'preventive', label: 'الصيانة الوقائية الدورية', icon: HardHat },
        { id: 'costs', label: 'تكاليف الصيانة والمصروفات', icon: DollarSign },
        { id: 'transfers', label: 'نقل المعدات والعمال بين الفروع', icon: ClipboardList },
      ],
    },
    {
      group: 'التقارير والنظام والحوكمة',
      items: [
        { id: 'reports', label: 'التقارير وتصدير البيانات', icon: FileSpreadsheet },
        { id: 'audit-log', label: 'سجل العمليات Audit Log', icon: History },
        { id: 'users', label: 'المستخدمون والصلاحيات', icon: ShieldCheck },
        { id: 'settings', label: 'النسخ الاحتياطي والضبط', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-slate-950 border-l border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:static lg:z-10`}
      >
        {/* Mobile Header with Close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-white text-sm">القائمة الرئيسية للمنظومة</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card inside sidebar */}
        <div className="p-3 m-3 mb-1 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              أفق
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-amber-400 font-semibold">{currentUser.role}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>النطاق المصرح:</span>
            <span className="text-slate-200 font-medium">
              {currentUser.branchName || 'كافة الفروع'}
            </span>
          </div>
        </div>

        {/* Navigation Links Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx}>
              <div className="px-3 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {sec.group}
              </div>
              <div className="space-y-0.5 mt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id as TabId);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/15'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-slate-950'
                              : 'text-slate-400 group-hover:text-amber-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                            isActive
                              ? 'bg-slate-950 text-amber-400'
                              : item.badgeColor === 'rose'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Quick Action Button */}
        {onLogout && (
          <div className="px-3 pb-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                onLogout();
              }}
              className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج من المنظومة</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          <div>شركة أفق البنية التحتية للمقاولات © 2026</div>
          <div className="text-[9px] text-slate-600 mt-0.5">الإصدار المركزي الموحد 2.5v</div>
        </div>
      </aside>
    </>
  );
};
