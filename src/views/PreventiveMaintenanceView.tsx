import React, { useState } from 'react';
import { PreventiveMaintenancePlan, SystemData, UserProfile } from '../types';
import {
  HardHat,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Truck,
  Wrench,
  DollarSign,
  User,
  X,
  Trash2,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface PreventiveMaintenanceViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSavePlan: (plan: PreventiveMaintenancePlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const PreventiveMaintenanceView: React.FC<PreventiveMaintenanceViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSavePlan,
  onDeletePlan,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlan, setNewPlan] = useState<Partial<PreventiveMaintenancePlan>>({
    maintenanceType: 'صيانة وقائية دورية 500 ساعة',
    nextDueDate: '2026-11-01',
    scheduledHours: 5000,
    estimatedCost: 3500,
    technicianName: 'فني الورشة المركزية',
    status: 'مجدولة',
    notes: 'استبدال فلاتر الزيت والوقود وفحص السيور وضغط الهيدروليك',
  });

  const canManage = canManageEntities(currentUser);

  const filteredPlans = data.preventivePlans.filter((p) => {
    const matchesBranch = selectedBranchId === 'ALL' || p.branchId === selectedBranchId;
    const matchesSearch =
      p.equipmentName.includes(searchQuery) ||
      p.equipmentNumber.includes(searchQuery) ||
      p.maintenanceType.includes(searchQuery) ||
      p.technicianName.includes(searchQuery);
    return matchesBranch && matchesSearch;
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.equipmentId) return;
    const equip = data.equipment.find((e) => e.id === newPlan.equipmentId);
    if (!equip) return;

    const planObj: PreventiveMaintenancePlan = {
      id: 'prev-' + Date.now(),
      equipmentId: equip.id,
      equipmentNumber: equip.equipmentNumber,
      equipmentName: equip.name,
      branchId: equip.branchId,
      nextDueDate: newPlan.nextDueDate || '2026-11-15',
      maintenanceType: newPlan.maintenanceType || 'صيانة دورية',
      currentOperatingHours: equip.operatingHours,
      scheduledHours: Number(newPlan.scheduledHours) || equip.operatingHours + 250,
      lastServiceDate: new Date().toISOString().split('T')[0],
      technicianName: newPlan.technicianName || currentUser.name,
      estimatedCost: Number(newPlan.estimatedCost) || 2000,
      notes: newPlan.notes || '',
      status: (newPlan.status as PreventiveMaintenancePlan['status']) || 'مجدولة',
    };

    onSavePlan(planObj);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">نظام الصيانة الوقائية والدورية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            جدولة الفحوصات الدورية حسب ساعات التشغيل (250، 500، 1000 ساعة) وتجنب الأعطال المفاجئة
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              if (data.equipment.length > 0) {
                setNewPlan({ ...newPlan, equipmentId: data.equipment[0].id });
              }
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة صيانة وقائية جديدة</span>
          </button>
        )}
      </div>

      {/* Due Alert Banner */}
      <div className="space-y-2">
        {data.preventivePlans
          .filter((p) => p.status === 'قادمة قريباً' || p.status === 'متأخرة')
          .map((plan) => (
            <div
              key={plan.id}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">اقتراب موعد صيانة وقائية: </span>
                  <span>
                    المعدة <span className="font-bold text-amber-300">{plan.equipmentName}</span> ({plan.equipmentNumber})
                    - {plan.maintenanceType} مقررة بتاريخ {plan.nextDueDate}.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
                {plan.status}
              </span>
            </div>
          ))}
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => {
          const branch = data.branches.find((b) => b.id === plan.branchId);

          return (
            <div
              key={plan.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {plan.equipmentNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      plan.status === 'قادمة قريباً'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : plan.status === 'مكتملة'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{plan.equipmentName}</h3>
                <div className="text-xs text-amber-400 font-medium mb-3">{plan.maintenanceType}</div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الفرع:</span>
                    <span className="text-white font-medium">{branch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ساعات التشغيل الحالية:</span>
                    <span className="font-mono text-white">{plan.currentOperatingHours} ساعة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الصيانة عند وصول:</span>
                    <span className="font-mono text-amber-400 font-bold">{plan.scheduledHours} ساعة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الموعد المستهدف:</span>
                    <span className="font-mono text-white font-bold">{plan.nextDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الفني المسؤول:</span>
                    <span className="text-slate-200">{plan.technicianName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">التكلفة التقديرية:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {plan.estimatedCost.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>

                {plan.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 mb-2">
                    {plan.notes}
                  </p>
                )}
              </div>

              {canManage && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const updated = { ...plan, status: 'مكتملة' as const };
                      onSavePlan(updated);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تأكيد إتمام الصيانة</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('حذف خطة الصيانة؟')) onDeletePlan(plan.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm">جدولة صيانة وقائية دورية</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">المعدة *</label>
                <select
                  required
                  value={newPlan.equipmentId || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, equipmentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentNumber} - {eq.name} ({eq.operatingHours} ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">نوع الصيانة الوقائية *</label>
                <input
                  type="text"
                  required
                  value={newPlan.maintenanceType}
                  onChange={(e) => setNewPlan({ ...newPlan, maintenanceType: e.target.value })}
                  placeholder="مثال: فحص 1000 ساعة واستبدال فلاتر الهيدروليك"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الموعد المستهدف *</label>
                  <input
                    type="date"
                    required
                    value={newPlan.nextDueDate}
                    onChange={(e) => setNewPlan({ ...newPlan, nextDueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ساعات التشغيل المستهدفة</label>
                  <input
                    type="number"
                    value={newPlan.scheduledHours}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, scheduledHours: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الفني / الورشة</label>
                  <input
                    type="text"
                    value={newPlan.technicianName}
                    onChange={(e) => setNewPlan({ ...newPlan, technicianName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة التقديرية (ر.س)</label>
                  <input
                    type="number"
                    value={newPlan.estimatedCost}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, estimatedCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الأعمال المقررة وملاحظات</label>
                <textarea
                  rows={2}
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
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
                  حفظ الخطة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
