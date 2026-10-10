import React from 'react';
import { SystemData } from '../types';
import {
  Building2,
  Users,
  Layers,
  Truck,
  Wrench,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';
import { TabId } from '../components/Sidebar';

interface CentralAdminOverviewProps {
  data: SystemData;
  onSelectBranchAndNavigate: (branchId: string, tab?: TabId) => void;
}

export const CentralAdminOverview: React.FC<CentralAdminOverviewProps> = ({
  data,
  onSelectBranchAndNavigate,
}) => {
  // Aggregate statistics for each branch
  const branchSummaries = data.branches.map((branch) => {
    const workers = data.workers.filter((w) => w.branchId === branch.id);
    const teams = data.teams.filter((t) => t.branchId === branch.id);
    const equipment = data.equipment.filter((e) => e.branchId === branch.id);
    const operatingEquip = equipment.filter((e) => e.status === 'تعمل');
    const stoppedEquip = equipment.filter((e) => e.status === 'متوقفة');
    const inMaintEquip = equipment.filter(
      (e) => e.status === 'في الصيانة' || e.status === 'تحت الفحص'
    );
    const openMaintReports = data.maintenanceReports.filter(
      (m) => m.branchId === branch.id && m.status !== 'مكتمل'
    );
    const openCases = data.laborCases.filter(
      (c) => c.branchId === branch.id && c.status !== 'مغلقة' && c.status !== 'تم حلها'
    );
    const projects = data.projects.filter((p) => p.branchId === branch.id);

    return {
      branch,
      workersCount: workers.length,
      teamsCount: teams.length,
      equipmentCount: equipment.length,
      operatingCount: operatingEquip.length,
      stoppedCount: stoppedEquip.length,
      maintenanceCount: inMaintEquip.length,
      openMaintCount: openMaintReports.length,
      openCasesCount: openCases.length,
      projectsCount: projects.length,
      // Critical severity flag
      hasCriticalIssue: inMaintEquip.length > 0 || openCases.length > 0 || stoppedEquip.length > 1,
    };
  });

  // Calculate grand totals across all branches
  const totals = branchSummaries.reduce(
    (acc, curr) => ({
      workers: acc.workers + curr.workersCount,
      teams: acc.teams + curr.teamsCount,
      equipment: acc.equipment + curr.equipmentCount,
      operating: acc.operating + curr.operatingCount,
      stopped: acc.stopped + curr.stoppedCount,
      maintenance: acc.maintenance + curr.maintenanceCount,
      cases: acc.cases + curr.openCasesCount,
      projects: acc.projects + curr.projectsCount,
    }),
    { workers: 0, teams: 0, equipment: 0, operating: 0, stopped: 0, maintenance: 0, cases: 0, projects: 0 }
  );

  const handleExportCSV = () => {
    const headers = [
      'الفرع',
      'كود الفرع',
      'مدير الفرع',
      'العمال',
      'الفرق',
      'المشاريع',
      'إجمالي المعدات',
      'المعدات العاملة',
      'المعدات المتوقفة',
      'المعدات بالصيانة',
      'القضايا المفتوحة',
    ];
    const rows = branchSummaries.map((s) => [
      s.branch.name,
      s.branch.code,
      s.branch.managerName,
      s.workersCount,
      s.teamsCount,
      s.projectsCount,
      s.equipmentCount,
      s.operatingCount,
      s.stoppedCount,
      s.maintenanceCount,
      s.openCasesCount,
    ]);
    exportToCSV('متابعة_الإدارة_المركزية_للفروع', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              لوحة متابعة الإدارة المركزية الموحدة للفروع
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مقارنة فورية للحالة التشغيلية والإنتاجية لفروع شركة أفق للبنية التحتية مع تمييز الحالات الحرجة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={() => printReport('تقرير الإدارة المركزية - شركة أفق')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Comparative Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>جدول الفروع الخمسة والجاهزية التشغيلية</span>
          </h2>
          <span className="text-xs text-slate-400">
            تحديث فوري تلقائي · 5 فروع معتمدة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3.5 px-4 font-bold text-slate-300">الفرع</th>
                <th className="py-3.5 px-3 font-semibold">مدير الفرع</th>
                <th className="py-3.5 px-3 font-semibold text-center">العمال</th>
                <th className="py-3.5 px-3 font-semibold text-center">الفرق</th>
                <th className="py-3.5 px-3 font-semibold text-center">المشاريع</th>
                <th className="py-3.5 px-3 font-semibold text-center">إجمالي المعدات</th>
                <th className="py-3.5 px-3 font-semibold text-center text-emerald-400">المعدات العاملة</th>
                <th className="py-3.5 px-3 font-semibold text-center text-amber-400">المتوقفة</th>
                <th className="py-3.5 px-3 font-semibold text-center text-rose-400">في الصيانة</th>
                <th className="py-3.5 px-3 font-semibold text-center text-rose-300">القضايا</th>
                <th className="py-3.5 px-3 font-semibold text-center">حالة الفرع</th>
                <th className="py-3.5 px-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {branchSummaries.map((summary) => {
                const b = summary.branch;
                const isCritical = summary.maintenanceCount > 0 || summary.openCasesCount > 0;

                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-850/60 transition-colors ${
                      isCritical ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                          }`}
                        />
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({b.code})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">{b.managerName}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-100">
                      {summary.workersCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-200">
                      {summary.teamsCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sky-400 font-semibold">
                      {summary.projectsCount}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-white">
                      {summary.equipmentCount}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-400">
                      {summary.operatingCount}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-bold ${
                          summary.stoppedCount > 0 ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        {summary.stoppedCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-black ${
                          summary.maintenanceCount > 0
                            ? 'text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded'
                            : 'text-slate-500'
                        }`}
                      >
                        {summary.maintenanceCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-bold ${
                          summary.openCasesCount > 0
                            ? 'text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded'
                            : 'text-slate-500'
                        }`}
                      >
                        {summary.openCasesCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectBranchAndNavigate(b.id, 'dashboard')}
                        className="p-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/30 flex items-center gap-1 mx-auto transition-colors"
                      >
                        <span>لوحة الفرع</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white">
                <td className="py-4 px-4 text-amber-400">الإجمالي العام (كافة الفروع)</td>
                <td className="py-4 px-3 text-slate-400">5 فروع متصلة</td>
                <td className="py-4 px-3 text-center text-amber-300 text-sm">{totals.workers}</td>
                <td className="py-4 px-3 text-center text-slate-200">{totals.teams}</td>
                <td className="py-4 px-3 text-center text-sky-400">{totals.projects}</td>
                <td className="py-4 px-3 text-center text-white text-sm">{totals.equipment}</td>
                <td className="py-4 px-3 text-center text-emerald-400 text-sm">{totals.operating}</td>
                <td className="py-4 px-3 text-center text-amber-400">{totals.stopped}</td>
                <td className="py-4 px-3 text-center text-rose-400 text-sm">{totals.maintenance}</td>
                <td className="py-4 px-3 text-center text-rose-300">{totals.cases}</td>
                <td className="py-4 px-3 text-center text-slate-400">-</td>
                <td className="py-4 px-4 text-center text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
