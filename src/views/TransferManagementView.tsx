import React, { useState } from 'react';
import {
  EquipmentTransferRecord,
  WorkerTransferRecord,
  SystemData,
  UserProfile,
} from '../types';
import {
  ArrowRightLeft,
  Truck,
  Users,
  Plus,
  Calendar,
  Building2,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';
import { exportToCSV, printReport } from '../utils/exportUtils';

interface TransferManagementViewProps {
  data: SystemData;
  currentUser: UserProfile;
  onTransferEquipment: (
    equipmentId: string,
    toBranchId: string,
    reason: string,
    officer: string,
    condition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'
  ) => void;
  onTransferWorker: (
    workerId: string,
    toBranchId: string,
    toTeamId: string,
    reason: string
  ) => void;
}

export const TransferManagementView: React.FC<TransferManagementViewProps> = ({
  data,
  currentUser,
  onTransferEquipment,
  onTransferWorker,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'equipment' | 'workers'>('equipment');

  // New Equipment Transfer Modal
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [selectedEquipId, setSelectedEquipId] = useState(data.equipment[0]?.id || '');
  const [targetEquipBranch, setTargetEquipBranch] = useState(data.branches[1]?.id || '');
  const [equipReason, setEquipReason] = useState('');
  const [equipCondition, setEquipCondition] = useState<'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'>('ممتازة');

  // New Worker Transfer Modal
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(data.workers[0]?.id || '');
  const [targetWorkerBranch, setTargetWorkerBranch] = useState(data.branches[0]?.id || '');
  const [targetWorkerTeam, setTargetWorkerTeam] = useState(data.teams[0]?.id || '');
  const [workerReason, setWorkerReason] = useState('');

  const canManage = canManageEntities(currentUser);

  // Collect all worker transfers across all workers
  const allWorkerTransfers = data.workers.flatMap((w) =>
    w.transferHistory.map((tr) => ({
      ...tr,
      workerName: w.fullName,
      employeeNumber: w.employeeNumber,
    }))
  );

  const handleEquipmentTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipId || !targetEquipBranch) return;
    onTransferEquipment(
      selectedEquipId,
      targetEquipBranch,
      equipReason,
      currentUser.name,
      equipCondition
    );
    setIsEquipModalOpen(false);
    setEquipReason('');
  };

  const handleWorkerTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId || !targetWorkerBranch) return;
    onTransferWorker(selectedWorkerId, targetWorkerBranch, targetWorkerTeam, workerReason);
    setIsWorkerModalOpen(false);
    setWorkerReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة النقل والمناقلات بين الفروع</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل مناقلات المعدات الثقيلة والقوى العاملة بين الفروع الخمسة مع الحفاظ التام على السجل التاريخي
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              {activeSubTab === 'equipment' ? (
                <button
                  onClick={() => setIsEquipModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>إصدار أمر نقل معدة</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsWorkerModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>إصدار أمر نقل عامل</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('equipment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'equipment'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>مناقلات المعدات والآليات ({data.equipmentTransfers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'workers'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مناقلات العمالة والفرق ({allWorkerTransfers.length})</span>
        </button>
      </div>

      {/* Equipment Transfers Table */}
      {activeSubTab === 'equipment' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>سجل أوامر نقل المعدات الثقيلة بين الفروع</span>
            </h3>
            <span className="text-xs text-slate-400">
              موثقة بمحاضر التسليم والاستلام الرسمية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">التاريخ</th>
                  <th className="py-3 px-3 font-semibold">المعدة</th>
                  <th className="py-3 px-3 font-semibold">من فرع</th>
                  <th className="py-3 px-3 font-semibold">إلى فرع</th>
                  <th className="py-3 px-3 font-semibold text-center">حالة المعدة</th>
                  <th className="py-3 px-3 font-semibold">المسؤول عن النقل</th>
                  <th className="py-3 px-4 font-semibold">سبب النقل والملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.equipmentTransfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">{tr.date}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{tr.equipmentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {tr.equipmentNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">{tr.fromBranch}</td>
                    <td className="py-3.5 px-3 text-emerald-400 font-bold">{tr.toBranch}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {tr.equipmentCondition}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-200">{tr.officer}</td>
                    <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-xs">
                      {tr.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workers Transfers Table */}
      {activeSubTab === 'workers' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>سجل مناقلات العمالة بين الفرق والفروع</span>
            </h3>
            <span className="text-xs text-slate-400">سجل تراكمي دائم لا يُحذف</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold text-slate-300">التاريخ</th>
                  <th className="py-3 px-3 font-semibold">العامل</th>
                  <th className="py-3 px-3 font-semibold">الفرع والفريق السابق</th>
                  <th className="py-3 px-3 font-semibold">الفرع والفريق الجديد</th>
                  <th className="py-3 px-3 font-semibold">معتمد بواسطة</th>
                  <th className="py-3 px-4 font-semibold">سبب المناقلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allWorkerTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      لا توجد مناقلات عمالة مسجلة بعد.
                    </td>
                  </tr>
                ) : (
                  allWorkerTransfers.map((wtr) => (
                    <tr key={wtr.id} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">{wtr.date}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{wtr.workerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {wtr.employeeNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {wtr.fromBranch} ({wtr.fromTeam})
                      </td>
                      <td className="py-3.5 px-3 text-emerald-400 font-bold">
                        {wtr.toBranch} ({wtr.toTeam})
                      </td>
                      <td className="py-3.5 px-3 text-slate-200">{wtr.approvedBy}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                        {wtr.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Transfer Modal */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm">إصدار أمر نقل معدة بين الفروع</h3>
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEquipmentTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">المعدة المراد نقلها *</label>
                <select
                  required
                  value={selectedEquipId}
                  onChange={(e) => setSelectedEquipId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentNumber} - {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الفرع المحال إليه (المستلم) *</label>
                <select
                  required
                  value={targetEquipBranch}
                  onChange={(e) => setTargetEquipBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">حالة المعدة الفنية عند النقل</label>
                <select
                  value={equipCondition}
                  onChange={(e) =>
                    setEquipCondition(
                      e.target.value as 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ممتازة">ممتازة وجاهزة للعمل الفوري</option>
                  <option value="جيدة">جيدة</option>
                  <option value="تحتاج صيانة">تحتاج صيانة</option>
                  <option value="متوقفة">متوقفة ومعطلة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب النقل والمشروع المستهدف *</label>
                <textarea
                  required
                  rows={2}
                  value={equipReason}
                  onChange={(e) => setEquipReason(e.target.value)}
                  placeholder="مثال: حاجة عاجلة لدعم أعمال الحفر الصخري في عقبة ضلع..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEquipModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  تأكيد النقل وتحديث التاريخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Transfer Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm">إصدار أمر مناقلة عامل</h3>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWorkerTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">العامل المراد نقله *</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.employeeNumber}) - {w.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الفرع الجديد *</label>
                <select
                  required
                  value={targetWorkerBranch}
                  onChange={(e) => {
                    setTargetWorkerBranch(e.target.value);
                    const bTeams = data.teams.filter((t) => t.branchId === e.target.value);
                    if (bTeams.length > 0) setTargetWorkerTeam(bTeams[0].id);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الفريق الجديد *</label>
                <select
                  required
                  value={targetWorkerTeam}
                  onChange={(e) => setTargetWorkerTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.teams
                    .filter((t) => t.branchId === targetWorkerBranch)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب المناقلة *</label>
                <textarea
                  required
                  rows={2}
                  value={workerReason}
                  onChange={(e) => setWorkerReason(e.target.value)}
                  placeholder="سبب النقل التشغيلي..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  اعتماد المناقلة وحفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
