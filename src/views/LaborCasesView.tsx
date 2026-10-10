import React, { useState } from 'react';
import { LaborCase, CaseStatus, SystemData, UserProfile, WorkerDocument } from '../types';
import {
  Scale,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  X,
  Search,
  Building2,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface LaborCasesViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveCase: (laborCase: LaborCase) => void;
  onDeleteCase: (caseId: string) => void;
}

export const LaborCasesView: React.FC<LaborCasesViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveCase,
  onDeleteCase,
}) => {
  const [editingCase, setEditingCase] = useState<LaborCase | null>(null);
  const [viewingCase, setViewingCase] = useState<LaborCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const canManage = canManageEntities(currentUser);

  const filteredCases = data.laborCases.filter((c) => {
    const matchesBranch = selectedBranchId === 'ALL' || c.branchId === selectedBranchId;
    const matchesSearch =
      c.workerName.includes(searchQuery) ||
      c.caseNumber.includes(searchQuery) ||
      c.issueType.includes(searchQuery) ||
      c.description.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesBranch && matchesSearch && matchesStatus;
  });

  const openNewCaseModal = () => {
    const defaultBranchId = selectedBranchId !== 'ALL' ? selectedBranchId : data.branches[0].id;
    setEditingCase({
      id: 'case-' + Date.now(),
      caseNumber: 'LC-' + new Date().getFullYear() + '-0' + (data.laborCases.length + 1),
      workerId: data.workers[0]?.id || '',
      workerName: data.workers[0]?.fullName || '',
      employeeNumber: data.workers[0]?.employeeNumber || '',
      branchId: defaultBranchId,
      teamId: data.workers[0]?.teamId || '',
      issueType: 'شكوى مكتب العمل',
      description: '',
      reportDate: new Date().toISOString().split('T')[0],
      authority: 'مكتب العمل واللجان الابتدائية',
      authorityCaseNumber: '',
      status: 'جديدة',
      actionsTaken: 'تم استلام الإشعار وإحالته للإدارة القانونية',
      lastUpdateDate: new Date().toISOString().split('T')[0],
      nextAppointmentDate: '2026-11-01',
      followUpOfficer: currentUser.name,
      documents: [],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase || !editingCase.workerName) return;
    onSaveCase(editingCase);
    setIsModalOpen(false);
    setEditingCase(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة المشاكل والقضايا العمالية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة قضايا مكتب العمل، الخلافات التعاقدية، جلسات الصلح الودي، والإجراءات القانونية
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewCaseModal}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل قضية جديدة</span>
          </button>
        )}
      </div>

      {/* Critical Cases Alert */}
      <div className="space-y-2">
        {data.laborCases
          .filter((c) => c.status === 'تحتاج إجراء' || c.status === 'قيد المتابعة')
          .map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-200"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">قضية تتطلب متابعة عاجلة: </span>
                  <span>
                    العامل <span className="font-bold text-rose-300">{c.workerName}</span> ({c.caseNumber})
                    - {c.issueType} لدى {c.authority}.
                  </span>
                </div>
              </div>
              {c.nextAppointmentDate && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                  الموعد القادم: {c.nextAppointmentDate}
                </span>
              )}
            </div>
          ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم القضية، اسم العامل، نوع المشكلة..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">حالة القضية:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة الحالات</option>
            <option value="جديدة">جديدة</option>
            <option value="قيد المتابعة">قيد المتابعة</option>
            <option value="تحتاج إجراء">تحتاج إجراء</option>
            <option value="لدى الجهة المختصة">لدى الجهة المختصة</option>
            <option value="تم حلها">تم حلها</option>
            <option value="مغلقة">مغلقة</option>
          </select>
        </div>
      </div>

      {/* Cases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => {
          const branch = data.branches.find((b) => b.id === c.branchId);

          return (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {c.caseNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      c.status === 'تحتاج إجراء' || c.status === 'قيد المتابعة'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : c.status === 'تم حلها' || c.status === 'مغلقة'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  {c.workerName}{' '}
                  <span className="text-xs text-slate-400 font-mono">({c.employeeNumber})</span>
                </h3>
                <div className="text-xs text-amber-400 font-medium mb-2">{c.issueType}</div>
                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-3 leading-relaxed">
                  {c.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>الجهة المختصة:</span>
                    <span className="text-slate-200">{c.authority}</span>
                  </div>
                  {c.authorityCaseNumber && (
                    <div className="flex justify-between">
                      <span>رقم المعاملة لدى الجهة:</span>
                      <span className="font-mono text-amber-300">{c.authorityCaseNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>الفرع:</span>
                    <span className="text-slate-200">{branch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المسؤول عن المتابعة:</span>
                    <span className="text-slate-200">{c.followUpOfficer}</span>
                  </div>
                  {c.nextAppointmentDate && (
                    <div className="flex justify-between text-amber-300 font-bold">
                      <span>الموعد القادم:</span>
                      <span className="font-mono">{c.nextAppointmentDate}</span>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <span className="text-slate-500 block mb-0.5">الإجراءات المتخذة:</span>
                    <p>{c.actionsTaken}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingCase(c);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="تعديل وتحديث الحالة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف ملف القضية ${c.caseNumber}؟`)) onDeleteCase(c.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Case Modal */}
      {isModalOpen && editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">ملف القضية / المشكلة العمالية</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">العامل المعني *</label>
                  <select
                    required
                    value={editingCase.workerId}
                    onChange={(e) => {
                      const w = data.workers.find((x) => x.id === e.target.value);
                      if (w) {
                        setEditingCase({
                          ...editingCase,
                          workerId: w.id,
                          workerName: w.fullName,
                          employeeNumber: w.employeeNumber,
                          branchId: w.branchId,
                          teamId: w.teamId,
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {data.workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} ({w.employeeNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم القضية الداخلي *</label>
                  <input
                    type="text"
                    required
                    value={editingCase.caseNumber}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, caseNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع المشكلة *</label>
                  <select
                    value={editingCase.issueType}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        issueType: e.target.value as LaborCase['issueType'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="شكوى مكتب العمل">شكوى مكتب العمل</option>
                    <option value="خلاف تعاقدي">خلاف تعاقدي</option>
                    <option value="مطالبة مالية">مطالبة مالية</option>
                    <option value="إصابة عمل">إصابة عمل</option>
                    <option value="بلاغ انقطاع">بلاغ انقطاع</option>
                    <option value="سلوك وظيفي">سلوك وظيفي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الجهة المختصة</label>
                  <select
                    value={editingCase.authority}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        authority: e.target.value as LaborCase['authority'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="مكتب العمل واللجان الابتدائية">مكتب العمل واللجان الابتدائية</option>
                    <option value="المحكمة العمالية">المحكمة العمالية</option>
                    <option value="الصلح الودي الداخلي">الصلح الودي الداخلي</option>
                    <option value="التأمينات الاجتماعية">التأمينات الاجتماعية</option>
                    <option value="الشرطة / المرور">الشرطة / المرور</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">وصف المشكلة / التفاصيل *</label>
                <textarea
                  required
                  rows={2}
                  value={editingCase.description}
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">حالة القضية *</label>
                  <select
                    value={editingCase.status}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        status: e.target.value as CaseStatus,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="جديدة">جديدة</option>
                    <option value="قيد المتابعة">قيد المتابعة</option>
                    <option value="تحتاج إجراء">تحتاج إجراء</option>
                    <option value="لدى الجهة المختصة">لدى الجهة المختصة</option>
                    <option value="تم حلها">تم حلها</option>
                    <option value="مغلقة">مغلقة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الموعد / الجلسة القادمة</label>
                  <input
                    type="date"
                    value={editingCase.nextAppointmentDate || ''}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, nextAppointmentDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الإجراءات المتخذة حتى الآن</label>
                <textarea
                  rows={2}
                  value={editingCase.actionsTaken}
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, actionsTaken: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المسؤول عن المتابعة</label>
                  <input
                    type="text"
                    value={editingCase.followUpOfficer}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, followUpOfficer: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم القضية لدى الجهة (إن وجد)</label>
                  <input
                    type="text"
                    value={editingCase.authorityCaseNumber || ''}
                    onChange={(e) =>
                      setEditingCase({ ...editingCase, authorityCaseNumber: e.target.value })
                    }
                    placeholder="مثال: LAB-MKH-9921"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  حفظ القضية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
