import React, { useState } from 'react';
import { Branch, SystemData, UserProfile } from '../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  Layers,
  Truck,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface BranchesViewProps {
  data: SystemData;
  currentUser: UserProfile;
  onSaveBranch: (branch: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
  onSelectBranchFilter: (branchId: string) => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  data,
  currentUser,
  onSaveBranch,
  onDeleteBranch,
  onSelectBranchFilter,
}) => {
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const canManage = canManageEntities(currentUser);

  const filteredBranches = data.branches.filter(
    (b) =>
      b.name.includes(searchQuery) ||
      b.managerName.includes(searchQuery) ||
      b.city.includes(searchQuery) ||
      b.code.includes(searchQuery)
  );

  const openNewBranchModal = () => {
    setEditingBranch({
      id: 'branch-' + Date.now(),
      name: '',
      code: 'BR-' + (data.branches.length + 1).toString().padStart(2, '0'),
      managerName: '',
      adminOfficer: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      coordinates: { lat: 24.7136, lng: 46.6753 },
      status: 'نشط',
      notes: '',
      createdDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name) return;
    onSaveBranch(editingBranch);
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(`هل أنت متأكد من حذف ${branch.name}؟ لن يتمكن المستخدمون من الوصول لبياناته.`)) {
      onDeleteBranch(branch.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة الفروع الإقليمية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة فروع الشركة (مكة، الرياض، أبها، العلايا، النماص) وإمكانية التوسع بإضافة فروع جديدة مستقبلاً
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={openNewBranchModal}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الفرع، المدير، المدينة أو الكود..."
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
        <div className="text-xs text-slate-400">
          إجمالي الفروع المسجلة: <span className="font-bold text-white">{filteredBranches.length}</span>
        </div>
      </div>

      {/* Branches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBranches.map((branch) => {
          const workersCount = data.workers.filter((w) => w.branchId === branch.id).length;
          const teamsCount = data.teams.filter((t) => t.branchId === branch.id).length;
          const equipmentCount = data.equipment.filter((e) => e.branchId === branch.id).length;
          const openMaint = data.maintenanceReports.filter(
            (m) => m.branchId === branch.id && m.status !== 'مكتمل'
          ).length;

          return (
            <div
              key={branch.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Branch Top Status & Code */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {branch.code}
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {branch.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mb-1">{branch.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{branch.notes}</p>

                {/* Metrics for this branch */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-4 text-center">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">العمالة</div>
                    <div className="text-sm font-bold text-sky-400">{workersCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">الفرق</div>
                    <div className="text-sm font-bold text-amber-400">{teamsCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 mb-0.5">المعدات</div>
                    <div className="text-sm font-bold text-emerald-400">{equipmentCount}</div>
                  </div>
                </div>

                {/* Contact and Management Details */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">مدير الفرع:</span>
                    <span className="font-semibold text-white">{branch.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">مسؤول الإدارة:</span>
                    <span className="text-slate-200">{branch.adminOfficer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">هاتف الفرع:</span>
                    <span className="font-mono text-amber-300" dir="ltr">{branch.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">العنوان:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{branch.address}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectBranchFilter(branch.id)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>تصفية العمليات على {branch.name}</span>
                </button>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBranch(branch);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="تعديل بيانات الفرع"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {data.branches.length > 1 && (
                      <button
                        onClick={() => handleDelete(branch)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                        title="حذف الفرع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-sm">
                {editingBranch.name ? `تعديل: ${editingBranch.name}` : 'إضافة فرع جديد للشركة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الفرع *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    placeholder="مثال: فرع الطائف"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">كود الفرع *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.code}
                    onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">مدير الفرع *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.managerName}
                    onChange={(e) =>
                      setEditingBranch({ ...editingBranch, managerName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">مسؤول الإدارة والتشغيل *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.adminOfficer}
                    onChange={(e) =>
                      setEditingBranch({ ...editingBranch, adminOfficer: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">هاتف التواصل *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.phone}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingBranch.email}
                    onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المدينة</label>
                  <input
                    type="text"
                    value={editingBranch.city}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">حالة الفرع</label>
                  <select
                    value={editingBranch.status}
                    onChange={(e) =>
                      setEditingBranch({
                        ...editingBranch,
                        status: e.target.value as Branch['status'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="نشط">نشط</option>
                    <option value="تحت التوسعة">تحت التوسعة</option>
                    <option value="مؤقت">مؤقت</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">العنوان التفصيلي وموقع المقر</label>
                <input
                  type="text"
                  value={editingBranch.address}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  placeholder="اسم الشارع أو المخطط"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات تشغيلية</label>
                <textarea
                  rows={2}
                  value={editingBranch.notes || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  حفظ بيانات الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
