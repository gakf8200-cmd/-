import React from 'react';
import { SystemData, Branch } from '../types';
import {
  Users,
  Layers,
  Truck,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TabId } from '../components/Sidebar';

interface DashboardViewProps {
  data: SystemData;
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onNavigateTab: (tab: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  selectedBranchId,
  onSelectBranch,
  onNavigateTab,
}) => {
  // Filter data according to branch selection
  const isAll = selectedBranchId === 'ALL';
  const filteredWorkers = isAll
    ? data.workers
    : data.workers.filter((w) => w.branchId === selectedBranchId);

  const filteredTeams = isAll
    ? data.teams
    : data.teams.filter((t) => t.branchId === selectedBranchId);

  const filteredEquipment = isAll
    ? data.equipment
    : data.equipment.filter((e) => e.branchId === selectedBranchId);

  const filteredMaintenance = isAll
    ? data.maintenanceReports
    : data.maintenanceReports.filter((m) => m.branchId === selectedBranchId);

  const filteredCases = isAll
    ? data.laborCases
    : data.laborCases.filter((c) => c.branchId === selectedBranchId);

  const filteredProjects = isAll
    ? data.projects
    : data.projects.filter((p) => p.branchId === selectedBranchId);

  const activeBranch = data.branches.find((b) => b.id === selectedBranchId);

  // Workforce stats
  const totalWorkers = filteredWorkers.length;
  const onDutyWorkers = filteredWorkers.filter((w) => w.status === 'على رأس العمل').length;
  const onLeaveWorkers = filteredWorkers.filter((w) => w.status === 'إجازة').length;
  const absentOrSuspended = filteredWorkers.filter(
    (w) => w.status === 'غياب' || w.status === 'موقوف'
  ).length;
  const companySponsored = filteredWorkers.filter((w) => w.isCompanySponsorship).length;
  const outsideSponsored = filteredWorkers.filter((w) => !w.isCompanySponsorship).length;

  // Equipment stats
  const totalEquipment = filteredEquipment.length;
  const operatingEquipment = filteredEquipment.filter((e) => e.status === 'تعمل').length;
  const stoppedEquipment = filteredEquipment.filter((e) => e.status === 'متوقفة').length;
  const inMaintenanceEquipment = filteredEquipment.filter(
    (e) => e.status === 'في الصيانة' || e.status === 'تحت الفحص'
  ).length;

  // Maintenance & Tickets
  const openMaintenance = filteredMaintenance.filter((m) => m.status !== 'مكتمل').length;
  const closedOrReturned = filteredMaintenance.filter((m) => m.status === 'مكتمل').length;
  const openCases = filteredCases.filter(
    (c) => c.status !== 'مغلقة' && c.status !== 'تم حلها'
  ).length;

  // Total Maintenance Costs
  const totalMaintenanceCosts = filteredMaintenance.reduce((sum, m) => sum + (m.totalCost || 0), 0);

  // KPI Calculations
  const equipmentOperationalRate =
    totalEquipment > 0 ? Math.round((operatingEquipment / totalEquipment) * 100) : 0;
  const workforceAvailabilityRate =
    totalWorkers > 0 ? Math.round((onDutyWorkers / totalWorkers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Context Info */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isAll
                  ? 'لوحة المتابعة التشغيلية المركزية (جميع الفروع)'
                  : `لوحة مؤشرات ${activeBranch?.name}`}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              متابعة مباشرة ومحدثة فورياً لجاهزية المعدات، القوى العاملة، الصيانة، والمشاريع الإنشائية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">تصفية الفرع:</span>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => onSelectBranch('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isAll
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              {data.branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBranch(b.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedBranchId === b.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.name.replace('فرع ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Highlight KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">نسبة تشغيل الأسطول</div>
              <div className="text-base font-extrabold text-white">{equipmentOperationalRate}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">نسبة جاهزية العمالة</div>
              <div className="text-base font-extrabold text-white">{workforceAvailabilityRate}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">معدات في الصيانة / فحص</div>
              <div className="text-base font-extrabold text-rose-400">{inMaintenanceEquipment}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">إجمالي مصروفات الصيانة</div>
              <div className="text-base font-extrabold text-sky-300">
                {totalMaintenanceCosts.toLocaleString('ar-SA')} ر.س
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Comprehensive Requested Stat Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <span>المؤشرات والبطاقات الإحصائية المطلوبة</span>
          <span className="text-xs text-slate-500 font-normal">
            ({isAll ? 'لجميع الفروع' : activeBranch?.name})
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. إجمالي الموظفين والعمال */}
          <div
            onClick={() => onNavigateTab('workers')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>إجمالي العمال والموظفين</span>
              <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{totalWorkers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{onDutyWorkers} على رأس العمل</span>
            </div>
          </div>

          {/* 2. إجمالي الفرق */}
          <div
            onClick={() => onNavigateTab('teams')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>إجمالي الفرق الميدانية</span>
              <Layers className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{filteredTeams.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">فرق إنشائية وتمديدات</div>
          </div>

          {/* 3. إجمالي المعدات */}
          <div
            onClick={() => onNavigateTab('equipment')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>إجمالي المعدات والآليات</span>
              <Truck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{totalEquipment}</div>
            <div className="text-[11px] text-slate-400 mt-1">حفارات، شيولات، قلابات</div>
          </div>

          {/* 4. المعدات العاملة */}
          <div
            onClick={() => onNavigateTab('equipment')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>المعدات العاملة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{operatingEquipment}</div>
            <div className="text-[11px] text-slate-400 mt-1">جاهزة وتعمل بالمواقع</div>
          </div>

          {/* 5. المعدات المتوقفة */}
          <div
            onClick={() => onNavigateTab('equipment')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>المعدات المتوقفة</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-300">{stoppedEquipment}</div>
            <div className="text-[11px] text-slate-400 mt-1">توقف مؤقت / إجازة مشغل</div>
          </div>

          {/* 6. المعدات في الصيانة */}
          <div
            onClick={() => onNavigateTab('maintenance')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>معدات في الصيانة / فحص</span>
              <Wrench className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400">{inMaintenanceEquipment}</div>
            <div className="text-[11px] text-slate-400 mt-1">أعطال وإصلاحات جارية</div>
          </div>

          {/* 7. العمال الموجودون حالياً */}
          <div
            onClick={() => onNavigateTab('workers')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>العمال على رأس العمل</span>
              <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{onDutyWorkers}</div>
            <div className="text-[11px] text-slate-400 mt-1">مباشرون بالمواقع الميدانية</div>
          </div>

          {/* 8. العمال في إجازة */}
          <div
            onClick={() => onNavigateTab('leaves')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>العمال في إجازة</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-300">{onLeaveWorkers}</div>
            <div className="text-[11px] text-slate-400 mt-1">إجازات سنوية وطارئة</div>
          </div>

          {/* 9. عمال على كفالة الشركة */}
          <div
            onClick={() => onNavigateTab('workers')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>على كفالة الشركة</span>
              <Building2 className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-sky-400">{companySponsored}</div>
            <div className="text-[11px] text-slate-400 mt-1">كفالة شركة أفق المباشرة</div>
          </div>

          {/* 10. عمال خارج كفالة الشركة */}
          <div
            onClick={() => onNavigateTab('workers')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>خارج كفالة الشركة</span>
              <Users className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-300">{outsideSponsored}</div>
            <div className="text-[11px] text-slate-400 mt-1">تأجير عمالة / منصة أجير</div>
          </div>

          {/* 11. قضايا عمالية مفتوحة */}
          <div
            onClick={() => onNavigateTab('labor-cases')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>قضايا ومشاكل مفتوحة</span>
              <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400">{openCases}</div>
            <div className="text-[11px] text-slate-400 mt-1">تتطلب متابعة قانونية</div>
          </div>

          {/* 12. أعمال الصيانة المفتوحة */}
          <div
            onClick={() => onNavigateTab('maintenance')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>بلاغات الصيانة المفتوحة</span>
              <Wrench className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-300">{openMaintenance}</div>
            <div className="text-[11px] text-slate-400 mt-1">قيد الفحص أو الإصلاح</div>
          </div>

          {/* 13. معدات عادت للعمل بعد الصيانة */}
          <div
            onClick={() => onNavigateTab('maintenance')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>معدات تم إصلاحها وعادت</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{closedOrReturned}</div>
            <div className="text-[11px] text-slate-400 mt-1">أغلقت بلاغاتها بنجاح</div>
          </div>

          {/* 14. المشاريع الإنشائية النشطة */}
          <div
            onClick={() => onNavigateTab('projects')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>المشاريع النشطة</span>
              <Building2 className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{filteredProjects.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">بنية تحتية وسيول وسفلتة</div>
          </div>

          {/* 15. قطع غيار منخفضة الرصيد */}
          <div
            onClick={() => onNavigateTab('spare-parts')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>قطع غيار تحت الحد الأدنى</span>
              <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {data.spareParts.filter((p) => p.quantityInStock <= p.minimumThreshold).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">تحتاج أوامر شراء عاجلة</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Maintenance Tickets & Projects Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Maintenance 10-Stage Tickets */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>متابعة بلاغات الصيانة ومراحل الإصلاح الجارية</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع حالة المعدات العاطلة عبر مراحل الإصلاح العشرة المعتمدة
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>عرض كافة البلاغات</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredMaintenance.slice(0, 3).map((report) => {
              const currentStage = report.stagesHistory[report.currentStageIndex];
              const branch = data.branches.find((b) => b.id === report.branchId);

              return (
                <div
                  key={report.id}
                  onClick={() => onNavigateTab('maintenance')}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{report.equipmentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                          {report.equipmentNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            report.priority === 'عاجل'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {report.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{report.description}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="text-[11px] text-slate-400 block">{branch?.name}</span>
                      <span className="text-[10px] text-slate-500">{report.reportDate}</span>
                    </div>
                  </div>

                  {/* 10-Stage Mini Progress Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-850">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-amber-400 font-medium">
                        المرحلة الحالية: {currentStage?.stageName}
                      </span>
                      <span className="text-slate-400">
                        {report.currentStageIndex + 1} من 10 مراحل
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-full rounded-sm ${
                            idx < report.currentStageIndex
                              ? 'bg-emerald-500'
                              : idx === report.currentStageIndex
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects & Site Status */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>مشاريع البنية التحتية الجارية</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">نسب الإنجاز ومواقع العمل الميداني</p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>المشاريع</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          <div className="space-y-3.5">
            {filteredProjects.slice(0, 4).map((proj) => {
              const branch = data.branches.find((b) => b.id === proj.branchId);
              return (
                <div key={proj.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{proj.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        الجهة: <span className="text-slate-300">{proj.client}</span> · {branch?.name}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 shrink-0">
                      {proj.completionPercentage}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${proj.completionPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
