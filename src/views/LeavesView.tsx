import React, { useState } from 'react';
import { WorkerLeave, SystemData, UserProfile } from '../types';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  User,
  Calendar,
  Building2,
  Trash2,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface LeavesViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveLeave: (leave: WorkerLeave) => void;
  onDeleteLeave: (leaveId: string) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveLeave,
  onDeleteLeave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLeave, setNewLeave] = useState<Partial<WorkerLeave>>({
    leaveType: 'سنوية',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-11-10',
    daysCount: 30,
    status: 'سارية',
    notes: '',
  });

  const canManage = canManageEntities(currentUser);

  const filteredLeaves = data.leaves.filter((l) => {
    const matchesBranch = selectedBranchId === 'ALL' || l.branchId === selectedBranchId;
    const matchesSearch =
      l.workerName.includes(searchQuery) ||
      l.employeeNumber.includes(searchQuery) ||
      l.leaveType.includes(searchQuery);
    return matchesBranch && matchesSearch;
  });

  const calculateDaysRemaining = (endDateStr: string) => {
    const today = new Date();
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.workerId) return;
    const selectedWorker = data.workers.find((w) => w.id === newLeave.workerId);
    if (!selectedWorker) return;

    const leaveObj: WorkerLeave = {
      id: 'lv-' + Date.now(),
      workerId: selectedWorker.id,
      workerName: selectedWorker.fullName,
      employeeNumber: selectedWorker.employeeNumber,
      branchId: selectedWorker.branchId,
      teamId: selectedWorker.teamId,
      leaveType: (newLeave.leaveType as WorkerLeave['leaveType']) || 'سنوية',
      startDate: newLeave.startDate || new Date().toISOString().split('T')[0],
      endDate: newLeave.endDate || '2026-11-10',
      daysCount: Number(newLeave.daysCount) || 30,
      status: (newLeave.status as WorkerLeave['status']) || 'سارية',
      notes: newLeave.notes || '',
    };

    onSaveLeave(leaveObj);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة إجازات العمال ومتابعة العودة</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة الإجازات السنوية والمرضية وتنبيهات اقتراب موعد عودة العمال للميدان
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل إجازة جديدة</span>
          </button>
        )}
      </div>

      {/* Active Return Alerts Banner */}
      <div className="space-y-2">
        {data.leaves
          .filter((l) => l.status === 'سارية')
          .map((leave) => {
            const daysLeft = calculateDaysRemaining(leave.endDate);
            if (daysLeft <= 7 && daysLeft >= 0) {
              return (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">تنبيه عودة عامل: </span>
                      <span>
                        العامل <span className="text-amber-300 font-bold">{leave.workerName}</span> ({leave.employeeNumber})
                        تنتهي إجازته بتاريخ {leave.endDate}.
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    يتبقى {daysLeft} أيام على عودة العامل
                  </span>
                </div>
              );
            }
            return null;
          })}
      </div>

      {/* Leaves Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم العامل، الرقم، أو نوع الإجازة..."
            className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <span className="text-xs text-slate-400">
            إجمالي السجلات: <span className="font-bold text-white">{filteredLeaves.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-300">العامل</th>
                <th className="py-3 px-3 font-semibold">الفرع والفريق</th>
                <th className="py-3 px-3 font-semibold">نوع الإجازة</th>
                <th className="py-3 px-3 font-semibold text-center">المدة</th>
                <th className="py-3 px-3 font-semibold text-center">تاريخ البدء</th>
                <th className="py-3 px-3 font-semibold text-center">تاريخ الانتهاء</th>
                <th className="py-3 px-3 font-semibold text-center">الحالة والتنبيه</th>
                <th className="py-3 px-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeaves.map((leave) => {
                const branch = data.branches.find((b) => b.id === leave.branchId);
                const daysLeft = calculateDaysRemaining(leave.endDate);

                return (
                  <tr key={leave.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{leave.workerName}</div>
                      <div className="text-[11px] text-amber-400 font-mono">
                        {leave.employeeNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200">{branch?.name}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-white">
                      {leave.daysCount} يوم
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {leave.startDate}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {leave.endDate}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {leave.status === 'سارية' && daysLeft <= 7 && daysLeft >= 0 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          باقي {daysLeft} أيام للعودة
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                          {leave.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {canManage && (
                        <button
                          onClick={() => {
                            if (confirm('حذف سجل الإجازة؟')) onDeleteLeave(leave.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="p-2 border-b border-slate-800 flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">تسجيل إجازة عامل جديدة</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر العامل *</label>
                <select
                  required
                  value={newLeave.workerId || ''}
                  onChange={(e) => setNewLeave({ ...newLeave, workerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- اختر العامل --</option>
                  {data.workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.employeeNumber}) - {w.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الإجازة</label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) =>
                      setNewLeave({
                        ...newLeave,
                        leaveType: e.target.value as WorkerLeave['leaveType'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="سنوية">سنوية</option>
                    <option value="مرضية">مرضية</option>
                    <option value="طارئة">طارئة</option>
                    <option value="غير مدفوعة">غير مدفوعة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">عدد الأيام</label>
                  <input
                    type="number"
                    value={newLeave.daysCount}
                    onChange={(e) => setNewLeave({ ...newLeave, daysCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات الإجازة</label>
                <textarea
                  rows={2}
                  value={newLeave.notes}
                  onChange={(e) => setNewLeave({ ...newLeave, notes: e.target.value })}
                  placeholder="ملاحظات أو رقم تذكرة السفر..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
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
                  اعتماد الإجازة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
