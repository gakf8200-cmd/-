import React, { useState } from 'react';
import { SystemData, UserProfile } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Users,
  Truck,
  Wrench,
  Scale,
  Calendar,
  Building2,
  DollarSign,
  Download,
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/exportUtils';

interface ReportsViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'workers' | 'equipment' | 'maintenance' | 'cases'
  >('workers');

  const filteredWorkers =
    selectedBranchId === 'ALL'
      ? data.workers
      : data.workers.filter((w) => w.branchId === selectedBranchId);

  const filteredEquipment =
    selectedBranchId === 'ALL'
      ? data.equipment
      : data.equipment.filter((e) => e.branchId === selectedBranchId);

  const filteredMaintenance =
    selectedBranchId === 'ALL'
      ? data.maintenanceReports
      : data.maintenanceReports.filter((m) => m.branchId === selectedBranchId);

  const filteredCases =
    selectedBranchId === 'ALL'
      ? data.laborCases
      : data.laborCases.filter((c) => c.branchId === selectedBranchId);

  // 1. Export Workforce
  const exportWorkforceReport = () => {
    const headers = [
      'الرقم الوظيفي',
      'الاسم الكامل',
      'المهنة',
      'الجنسية',
      'الفرع',
      'الكفالة',
      'الحالة',
      'الإقامة',
      'الجوال',
    ];
    const rows = filteredWorkers.map((w) => {
      const b = data.branches.find((br) => br.id === w.branchId);
      return [
        w.employeeNumber,
        w.fullName,
        w.jobTitle,
        w.nationality,
        b?.name || '',
        w.isCompanySponsorship ? 'كفالة الشركة' : 'خارج الكفالة',
        w.status,
        w.residencyStatus,
        w.phone,
      ];
    });
    exportToCSV('تقرير_العمالة_الشامل_شركة_أفق', headers, rows);
  };

  // 2. Export Equipment
  const exportEquipmentReport = () => {
    const headers = [
      'رقم المعدة',
      'اسم المعدة',
      'الماركة',
      'الموديل',
      'سنة الصنع',
      'الفرع',
      'المشغل',
      'الحالة',
      'ساعات التشغيل',
      'الموقع',
    ];
    const rows = filteredEquipment.map((e) => {
      const b = data.branches.find((br) => br.id === e.branchId);
      return [
        e.equipmentNumber,
        e.name,
        e.brand,
        e.model,
        e.manufactureYear,
        b?.name || '',
        e.operatorName,
        e.status,
        e.operatingHours,
        e.location,
      ];
    });
    exportToCSV('تقرير_الأسطول_والمعدات_شركة_أفق', headers, rows);
  };

  // 3. Export Maintenance
  const exportMaintenanceReport = () => {
    const headers = [
      'رقم البلاغ',
      'المعدة',
      'الفرع',
      'تاريخ البلاغ',
      'نوع العطل',
      'الأولوية',
      'المرحلة الحالية',
      'إجمالي التكلفة',
      'الحالة',
    ];
    const rows = filteredMaintenance.map((m) => {
      const b = data.branches.find((br) => br.id === m.branchId);
      return [
        m.reportNumber,
        m.equipmentName,
        b?.name || '',
        m.reportDate,
        m.faultType,
        m.priority,
        m.stagesHistory[m.currentStageIndex]?.stageName || '',
        m.totalCost,
        m.status,
      ];
    });
    exportToCSV('تقرير_الصيانة_والأعطال_شركة_أفق', headers, rows);
  };

  // 4. Export Legal Cases
  const exportCasesReport = () => {
    const headers = [
      'رقم القضية',
      'العامل',
      'الرقم الوظيفي',
      'الفرع',
      'نوع القضية',
      'الجهة المختصة',
      'الحالة',
      'الموعد القادم',
      'المسؤول عن المتابعة',
    ];
    const rows = filteredCases.map((c) => {
      const b = data.branches.find((br) => br.id === c.branchId);
      return [
        c.caseNumber,
        c.workerName,
        c.employeeNumber,
        b?.name || '',
        c.issueType,
        c.authority,
        c.status,
        c.nextAppointmentDate || '-',
        c.followUpOfficer,
      ];
    });
    exportToCSV('تقرير_القضايا_العمالية_شركة_أفق', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">مركز التقارير التنفيذية والتصدير</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إصدار وتصدير تقارير العمالة، الأسطول، الصيانة والأعطال، والقضايا بصيغتي Excel و PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeReportTab === 'workers' && (
            <button
              onClick={exportWorkforceReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير العمالة (Excel)</span>
            </button>
          )}

          {activeReportTab === 'equipment' && (
            <button
              onClick={exportEquipmentReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير الأسطول (Excel)</span>
            </button>
          )}

          {activeReportTab === 'maintenance' && (
            <button
              onClick={exportMaintenanceReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير الصيانة (Excel)</span>
            </button>
          )}

          {activeReportTab === 'cases' && (
            <button
              onClick={exportCasesReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير القضايا (Excel)</span>
            </button>
          )}

          <button
            onClick={() => printReport('تقرير شركة أفق للبنية التحتية للمقاولات')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveReportTab('workers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'workers'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>تقرير العمالة والكفالات ({filteredWorkers.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('equipment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'equipment'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>تقرير المعدات وجاهزية الأسطول ({filteredEquipment.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'maintenance'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>تقرير الصيانة والتكاليف ({filteredMaintenance.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('cases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'cases'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>تقرير القضايا والمتابعة ({filteredCases.length})</span>
        </button>
      </div>

      {/* Render Active Report Table */}
      {activeReportTab === 'workers' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">كشف العمالة والوضع الوظيفي والكفالة</h3>
            <span className="text-xs text-slate-400 font-mono">
              كفالة الشركة: {filteredWorkers.filter((w) => w.isCompanySponsorship).length} · خارج
              الكفالة: {filteredWorkers.filter((w) => !w.isCompanySponsorship).length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">الرقم الوظيفي</th>
                  <th className="py-3 px-3 font-semibold">اسم العامل</th>
                  <th className="py-3 px-3 font-semibold">المهنة</th>
                  <th className="py-3 px-3 font-semibold">الجنسية</th>
                  <th className="py-3 px-3 font-semibold">الفرع</th>
                  <th className="py-3 px-3 font-semibold text-center">الكفالة</th>
                  <th className="py-3 px-3 font-semibold text-center">الإقامة</th>
                  <th className="py-3 px-3 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWorkers.map((w) => {
                  const b = data.branches.find((br) => br.id === w.branchId);
                  return (
                    <tr key={w.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {w.employeeNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{w.fullName}</td>
                      <td className="py-3 px-3 text-slate-200">{w.jobTitle}</td>
                      <td className="py-3 px-3 text-slate-300">{w.nationality}</td>
                      <td className="py-3 px-3 text-slate-200">{b?.name}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.isCompanySponsorship
                              ? 'bg-sky-500/15 text-sky-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {w.isCompanySponsorship ? 'كفالة الشركة' : 'خارج الكفالة'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">{w.residencyStatus}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-emerald-400">
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'equipment' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">كشف المعدات والآليات وساعات التشغيل</h3>
            <span className="text-xs text-slate-400 font-mono">
              تعمل: {filteredEquipment.filter((e) => e.status === 'تعمل').length} · متوقفة:{' '}
              {filteredEquipment.filter((e) => e.status === 'متوقفة').length} · بالصيانة:{' '}
              {filteredEquipment.filter((e) => e.status === 'في الصيانة').length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">رقم المعدة</th>
                  <th className="py-3 px-3 font-semibold">اسم المعدة</th>
                  <th className="py-3 px-3 font-semibold">الماركة والموديل</th>
                  <th className="py-3 px-3 font-semibold">الفرع</th>
                  <th className="py-3 px-3 font-semibold">المشغل</th>
                  <th className="py-3 px-3 font-semibold text-center">ساعات التشغيل</th>
                  <th className="py-3 px-3 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEquipment.map((e) => {
                  const b = data.branches.find((br) => br.id === e.branchId);
                  return (
                    <tr key={e.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {e.equipmentNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{e.name}</td>
                      <td className="py-3 px-3 text-slate-200">
                        {e.brand} ({e.model})
                      </td>
                      <td className="py-3 px-3 text-slate-200">{b?.name}</td>
                      <td className="py-3 px-3 text-slate-300">{e.operatorName}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        {e.operatingHours} ساعة
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            e.status === 'تعمل'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : e.status === 'في الصيانة'
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'maintenance' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">كشف بلاغات الصيانة ومراحلها وتكاليفها</h3>
            <span className="text-xs text-slate-400 font-mono">
              إجمالي التكاليف:{' '}
              {filteredMaintenance
                .reduce((sum, m) => sum + (m.totalCost || 0), 0)
                .toLocaleString('ar-SA')}{' '}
              ر.س
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">رقم البلاغ</th>
                  <th className="py-3 px-3 font-semibold">المعدة</th>
                  <th className="py-3 px-3 font-semibold">تاريخ البلاغ</th>
                  <th className="py-3 px-3 font-semibold">نوع العطل</th>
                  <th className="py-3 px-3 font-semibold">المرحلة الحالية</th>
                  <th className="py-3 px-3 font-semibold text-center">التكلفة</th>
                  <th className="py-3 px-3 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {m.reportNumber}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{m.equipmentName}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{m.reportDate}</td>
                    <td className="py-3 px-3 text-slate-200">{m.faultType}</td>
                    <td className="py-3 px-3 text-amber-300">
                      {m.stagesHistory[m.currentStageIndex]?.stageName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                      {m.totalCost.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'cases' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">كشف القضايا والمشاكل العمالية</h3>
            <span className="text-xs text-slate-400 font-mono">
              المفتوحة: {filteredCases.filter((c) => c.status !== 'مغلقة' && c.status !== 'تم حلها').length} · المغلقة:{' '}
              {filteredCases.filter((c) => c.status === 'مغلقة' || c.status === 'تم حلها').length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">رقم القضية</th>
                  <th className="py-3 px-3 font-semibold">العامل</th>
                  <th className="py-3 px-3 font-semibold">نوع المشكلة</th>
                  <th className="py-3 px-3 font-semibold">الجهة المختصة</th>
                  <th className="py-3 px-3 font-semibold">المسؤول عن المتابعة</th>
                  <th className="py-3 px-3 font-semibold text-center">الموعد القادم</th>
                  <th className="py-3 px-3 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.caseNumber}</td>
                    <td className="py-3 px-3 font-bold text-white">{c.workerName}</td>
                    <td className="py-3 px-3 text-slate-200">{c.issueType}</td>
                    <td className="py-3 px-3 text-slate-300">{c.authority}</td>
                    <td className="py-3 px-3 text-slate-300">{c.followUpOfficer}</td>
                    <td className="py-3 px-3 text-center font-mono text-amber-300 font-bold">
                      {c.nextAppointmentDate || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-rose-300 font-medium">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
