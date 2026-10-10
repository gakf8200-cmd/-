import React, { useState } from 'react';
import { AuditLogItem, SystemData } from '../types';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  Building2,
  User,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

interface AuditLogViewProps {
  data: SystemData;
  selectedBranchId: string;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  data,
  selectedBranchId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = data.auditLogs.filter((log) => {
    const matchesBranch =
      selectedBranchId === 'ALL' ||
      log.branchId === selectedBranchId ||
      log.branchId === 'ALL';
    const matchesSearch =
      log.userName.includes(searchQuery) ||
      log.description.includes(searchQuery) ||
      (log.entityId && log.entityId.includes(searchQuery)) ||
      log.userRole.includes(searchQuery);
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

    return matchesBranch && matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = [
      'التاريخ والوقت',
      'المستخدم',
      'الدور الوظيفي',
      'الفرع',
      'نوع العملية',
      'الكيان المعني',
      'الوصف التفصيلي',
    ];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.userName,
      l.userRole,
      l.branchName || 'الإدارة المركزية',
      l.actionType,
      l.entityType,
      l.description,
    ]);
    exportToCSV('سجل_العمليات_Audit_Log_شركة_أفق', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">سجل العمليات والرقابة (Audit Log)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل رقابي غير قابل للتعديل أو الحذف يوثق كل إضافة أو تعديل أو نقل قام به أي مستخدم
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>تصدير السجل الرقابي (Excel)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث: اسم المستخدم، الوصف، رقم المعدة أو العامل..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">نوع العملية:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة العمليات</option>
            <option value="إضافة">إضافة</option>
            <option value="تعديل">تعديل</option>
            <option value="حذف">حذف</option>
            <option value="نقل">نقل ومناقلة</option>
            <option value="تحديث مرحلة صيانة">تحديث مرحلة صيانة</option>
            <option value="تسجيل إجازة">تسجيل إجازة</option>
            <option value="رفع مستند">رفع مستند</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-300">التاريخ والوقت</th>
                <th className="py-3 px-3 font-semibold">المستخدم المنفذ</th>
                <th className="py-3 px-3 font-semibold">الدور والفرع</th>
                <th className="py-3 px-3 font-semibold text-center">نوع العملية</th>
                <th className="py-3 px-3 font-semibold text-center">الكيان</th>
                <th className="py-3 px-4 font-semibold">تفاصيل الإجراء المنفذ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50">
                  <td className="py-3.5 px-4 font-mono text-amber-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                    <div>{log.userRole}</div>
                    <div className="text-[10px] text-slate-500">{log.branchName}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionType === 'حذف'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : log.actionType === 'إضافة'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.actionType === 'نقل'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-300 font-medium">
                    {log.entityType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 leading-relaxed font-normal">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
