import React, { useState } from 'react';
import { SparePart, SystemData, UserProfile } from '../types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  DollarSign,
  Truck,
  X,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';
import { exportToCSV } from '../utils/exportUtils';

interface SparePartsViewProps {
  data: SystemData;
  currentUser: UserProfile;
  onSaveSparePart: (part: SparePart) => void;
  onDeleteSparePart: (partId: string) => void;
}

export const SparePartsView: React.FC<SparePartsViewProps> = ({
  data,
  currentUser,
  onSaveSparePart,
  onDeleteSparePart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const canManage = canManageEntities(currentUser);

  const filteredParts = data.spareParts.filter((p) => {
    const matchesSearch =
      p.name.includes(searchQuery) ||
      p.partNumber.includes(searchQuery) ||
      p.compatibleEquipment.includes(searchQuery) ||
      p.supplier.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lowStockParts = data.spareParts.filter(
    (p) => p.quantityInStock <= p.minimumThreshold
  );

  const openNewPartModal = () => {
    setEditingPart({
      id: 'prt-' + Date.now(),
      partNumber: 'PART-' + (data.spareParts.length + 101),
      name: '',
      category: 'قطع ميكانيكية',
      compatibleEquipment: '',
      supplier: '',
      unitPrice: 500,
      quantityInStock: 5,
      minimumThreshold: 2,
      status: 'متوفر',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart || !editingPart.name) return;

    // Auto update status based on threshold
    const updatedStatus =
      editingPart.quantityInStock <= 0
        ? 'تم الطلب'
        : editingPart.quantityInStock <= editingPart.minimumThreshold
        ? 'منخفض'
        : 'متوفر';

    onSaveSparePart({ ...editingPart, status: updatedStatus });
    setIsModalOpen(false);
    setEditingPart(null);
  };

  const handleExportCSV = () => {
    const headers = ['رقم القطعة', 'اسم القطعة', 'التصنيف', 'المعدة المتوافقة', 'المورد', 'سعر الوحدة', 'الكمية بالمستودع', 'حد الطلب', 'الحالة'];
    const rows = filteredParts.map((p) => [
      p.partNumber,
      p.name,
      p.category,
      p.compatibleEquipment,
      p.supplier,
      p.unitPrice,
      p.quantityInStock,
      p.minimumThreshold,
      p.status,
    ]);
    exportToCSV('مخزون_قطع_الغيار_شركة_أفق', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة قطع الغيار ومستودع الصيانة</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة قطع غيار الآليات، أسعار التوريد، الحدود الدنيا للأمان، والموردين المعتمدين
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
          {canManage && (
            <button
              onClick={openNewPartModal}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قطعة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockParts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-white">تنبيه انخفاض مخزون: </span>
              <span>
                توجد <span className="font-bold text-rose-300">{lowStockParts.length}</span> قطع غيار
                وصلت للحد الأدنى في المستودع ويجب إصدار أوامر شراء عاجلة لها.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث: اسم القطعة، رقمها، المعدة، المورد..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">حالة المخزون:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة الحالات</option>
            <option value="متوفر">متوفر</option>
            <option value="منخفض">منخفض تحت الحد الأدنى</option>
            <option value="تم الطلب">تم الطلب / بانتظار الاستلام</option>
          </select>
        </div>
      </div>

      {/* Spare Parts Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParts.map((part) => {
          const isLow = part.quantityInStock <= part.minimumThreshold;

          return (
            <div
              key={part.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isLow ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {part.partNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      isLow
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isLow ? 'مخزون منخفض' : part.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{part.name}</h3>
                <div className="text-xs text-slate-400 mb-3">{part.category}</div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">المعدة المتوافقة:</span>
                    <span className="text-slate-200">{part.compatibleEquipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المورد المعتمد:</span>
                    <span className="text-slate-300">{part.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">سعر الوحدة:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {part.unitPrice.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحد الأدنى للأمان:</span>
                    <span className="font-mono text-slate-400">{part.minimumThreshold} قطع</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400">الكمية المتوفرة حالياً:</span>
                  <span
                    className={`font-mono text-base font-extrabold ${
                      isLow ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {part.quantityInStock} قطعة
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const updated = { ...part, quantityInStock: part.quantityInStock + 5 };
                      onSaveSparePart(updated);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>توريد +5 قطع</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPart(part);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف القطعة ${part.name}؟`)) onDeleteSparePart(part.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Part Modal */}
      {isModalOpen && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm">بيانات قطعة الغيار</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم القطعة *</label>
                  <input
                    type="text"
                    required
                    value={editingPart.name}
                    onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم القطعة (Part Number) *</label>
                  <input
                    type="text"
                    required
                    value={editingPart.partNumber}
                    onChange={(e) => setEditingPart({ ...editingPart, partNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المعدة المتوافقة</label>
                  <input
                    type="text"
                    value={editingPart.compatibleEquipment}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, compatibleEquipment: e.target.value })
                    }
                    placeholder="حفار كوماتسو، بلدوزر CAT..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المورد</label>
                  <input
                    type="text"
                    value={editingPart.supplier}
                    onChange={(e) => setEditingPart({ ...editingPart, supplier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">السعر (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={editingPart.unitPrice}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, unitPrice: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الكمية المتوفرة</label>
                  <input
                    type="number"
                    value={editingPart.quantityInStock}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, quantityInStock: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">حد الأمان الأدنى</label>
                  <input
                    type="number"
                    value={editingPart.minimumThreshold}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, minimumThreshold: Number(e.target.value) })
                    }
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
                  حفظ القطعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
