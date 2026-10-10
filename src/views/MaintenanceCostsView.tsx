import React, { useState } from 'react';
import { SystemData, UserProfile } from '../types';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Truck,
  Wrench,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';

interface MaintenanceCostsViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
}

export const MaintenanceCostsView: React.FC<MaintenanceCostsViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter reports according to branch selection
  const relevantReports =
    selectedBranchId === 'ALL'
      ? data.maintenanceReports
      : data.maintenanceReports.filter((m) => m.branchId === selectedBranchId);

  // Totals calculations
  const totalPartsCost = relevantReports.reduce((sum, r) => sum + (r.partsCost || 0), 0);
  const totalLaborCost = relevantReports.reduce((sum, r) => sum + (r.laborCost || 0), 0);
  const totalWorkshopCost = relevantReports.reduce((sum, r) => sum + (r.workshopCost || 0), 0);
  const totalOtherCost = relevantReports.reduce((sum, r) => sum + (r.otherCost || 0), 0);
  const grandTotalCost =
    totalPartsCost + totalLaborCost + totalWorkshopCost + totalOtherCost;

  // Breakdown by Branch
  const costsByBranch = data.branches.map((branch) => {
    const branchReports = data.maintenanceReports.filter((m) => m.branchId === branch.id);
    const parts = branchReports.reduce((sum, r) => sum + (r.partsCost || 0), 0);
    const labor = branchReports.reduce((sum, r) => sum + (r.laborCost || 0), 0);
    const workshop = branchReports.reduce((sum, r) => sum + (r.workshopCost || 0), 0);
    const other = branchReports.reduce((sum, r) => sum + (r.otherCost || 0), 0);
    const total = parts + labor + workshop + other;

    return {
      branch,
      ticketsCount: branchReports.length,
      parts,
      labor,
      workshop,
      other,
      total,
    };
  });

  // Breakdown by Equipment
  const costsByEquipment = data.equipment.map((equip) => {
    const equipReports = data.maintenanceReports.filter((m) => m.equipmentId === equip.id);
    const total = equipReports.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const branch = data.branches.find((b) => b.id === equip.branchId);

    return {
      equip,
      branchName: branch?.name,
      reportsCount: equipReports.length,
      totalCost: total,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  const handleExportCSV = () => {
    const headers = [
      'رقم البلاغ',
      'المعدة',
      'الفرع',
      'تاريخ البلاغ',
      'قطع الغيار',
      'أجور العمالة',
      'أجور الورشة',
      'مصروفات أخرى',
      'إجمالي التكلفة',
    ];
    const rows = relevantReports.map((r) => {
      const b = data.branches.find((br) => br.id === r.branchId);
      return [
        r.reportNumber,
        r.equipmentName,
        b?.name || '',
        r.reportDate,
        r.partsCost,
        r.laborCost,
        r.workshopCost,
        r.otherCost,
        r.totalCost,
      ];
    });
    exportToCSV('تقرير_تكاليف_الصيانة_شركة_أفق', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة تكاليف الصيانة والمصروفات المالية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تقارير تفصيلية لتكاليف قطع الغيار، أجور الفنيين والورش، وتحليل المصروفات لكل فرع ومعدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={() => printReport('تقرير التكاليف المالية للصيانة - شركة أفق')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-xs mb-1">قطع الغيار الأصلية</span>
          <div className="text-xl font-black text-sky-400 font-mono">
            {totalPartsCost.toLocaleString('ar-SA')} ر.س
          </div>
          <span className="text-[11px] text-slate-500">طرمبات، فلاتر، خراطيم</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-xs mb-1">أجور العمالة والفنيين</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {totalLaborCost.toLocaleString('ar-SA')} ر.س
          </div>
          <span className="text-[11px] text-slate-500">ساعات عمل الفنيين</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-xs mb-1">الورش والمخارط</span>
          <div className="text-xl font-black text-purple-400 font-mono">
            {totalWorkshopCost.toLocaleString('ar-SA')} ر.س
          </div>
          <span className="text-[11px] text-slate-500">أعمال الخراطة والتوكيلات</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block text-xs mb-1">مصروفات أخرى ونقل</span>
          <div className="text-xl font-black text-slate-300 font-mono">
            {totalOtherCost.toLocaleString('ar-SA')} ر.س
          </div>
          <span className="text-[11px] text-slate-500">شاحنات النقل والزيوت</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 col-span-2 sm:col-span-1">
          <span className="text-amber-400 block text-xs font-bold mb-1">إجمالي تكلفة الصيانة</span>
          <div className="text-xl font-black text-amber-300 font-mono">
            {grandTotalCost.toLocaleString('ar-SA')} ر.س
          </div>
          <span className="text-[11px] text-amber-400/80">المصروف الفعلي التراكمي</span>
        </div>
      </div>

      {/* Two Matrix Tables: Costs by Branch & Top Costly Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table 1: Breakdown by Branch */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>تكاليف الصيانة الشهرية والسنوية حسب الفرع</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">5 فروع</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">الفرع</th>
                  <th className="py-3 px-3 font-semibold text-center">البلاغات</th>
                  <th className="py-3 px-3 font-semibold text-center">قطع الغيار</th>
                  <th className="py-3 px-3 font-semibold text-center">العمالة والورشة</th>
                  <th className="py-3 px-4 font-bold text-amber-400 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {costsByBranch.map((item) => (
                  <tr key={item.branch.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-bold text-white">{item.branch.name}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                      {item.ticketsCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sky-300 font-mono">
                      {item.parts.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                      {(item.labor + item.workshop).toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-400 font-mono">
                      {item.total.toLocaleString('ar-SA')} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Top Maintenance Expensive Equipment */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-400" />
              <span>أكثر المعدات تكلفة في الصيانة والأعطال</span>
            </h3>
            <span className="text-xs text-slate-400">ترتيب تنازلي</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
            {costsByEquipment.map((eqItem) => (
              <div key={eqItem.equip.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">
                    {eqItem.equip.name}{' '}
                    <span className="text-amber-400 font-mono text-[11px]">
                      ({eqItem.equip.equipmentNumber})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    الفرع: {eqItem.branchName} · {eqItem.reportsCount} بلاغات
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-amber-400 font-bold block text-sm">
                    {eqItem.totalCost.toLocaleString('ar-SA')} ر.س
                  </span>
                  <span className="text-[10px] text-slate-500">إجمالي الإصلاح</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
