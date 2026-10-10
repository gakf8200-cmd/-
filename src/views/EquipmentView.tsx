import React, { useState } from 'react';
import {
  Equipment,
  EquipmentStatus,
  EquipmentTimelineEvent,
  SystemData,
  UserProfile,
} from '../types';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  History,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  X,
  Gauge,
  MapPin,
  Calendar,
  Building2,
  PlusCircle,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface EquipmentViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (equipmentId: string) => void;
  onTransferEquipment: (
    equipmentId: string,
    toBranchId: string,
    reason: string,
    officer: string,
    condition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'
  ) => void;
  onViewEquipmentHistory: (equipmentId: string) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveEquipment,
  onDeleteEquipment,
  onTransferEquipment,
  onViewEquipmentHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [transferringEquip, setTransferringEquip] = useState<Equipment | null>(null);
  const [newTimelineForEquip, setNewTimelineForEquip] = useState<Equipment | null>(null);

  // Transfer form state
  const [transferToBranch, setTransferToBranch] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferCondition, setTransferCondition] = useState<'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'>('ممتازة');

  // Timeline add state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<EquipmentTimelineEvent['type']>('صيانة');
  const [newEventCost, setNewEventCost] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = canManageEntities(currentUser);

  const filteredEquipment = data.equipment.filter((e) => {
    const matchesBranch = selectedBranchId === 'ALL' || e.branchId === selectedBranchId;
    const matchesSearch =
      e.name.includes(searchQuery) ||
      e.equipmentNumber.includes(searchQuery) ||
      e.brand.includes(searchQuery) ||
      e.model.includes(searchQuery) ||
      e.operatorName.includes(searchQuery) ||
      e.serialNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || e.type.includes(typeFilter);

    return matchesBranch && matchesSearch && matchesStatus && matchesType;
  });

  const openNewEquipmentModal = () => {
    const defaultBranchId = selectedBranchId !== 'ALL' ? selectedBranchId : data.branches[0].id;
    setEditingEquipment({
      id: 'eq-' + Date.now(),
      equipmentNumber: 'EQ-' + (data.equipment.length + 101),
      name: '',
      type: 'حفار مجنزر ثقيل',
      brand: 'كاتربيلر (Caterpillar)',
      model: '',
      manufactureYear: 2024,
      serialNumber: 'SN-' + Math.floor(Math.random() * 900000 + 100000),
      plateNumber: '',
      branchId: defaultBranchId,
      teamId: data.teams[0]?.id,
      location: 'الموقع الرئيسي',
      operatorName: '',
      status: 'تعمل',
      entryDate: new Date().toISOString().split('T')[0],
      operatingStartDate: new Date().toISOString().split('T')[0],
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: '2026-12-01',
      operatingHours: 1200,
      notes: '',
      timeline: [
        {
          id: 'tl-init-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          title: 'استلام المعدة ودخولها الأسطول',
          description: 'تم فحص المعدة واستلامها وإدراجها ضمن أسطول شركة أفق للبنية التحتية',
          type: 'استلام',
          performedBy: currentUser.name,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment || !editingEquipment.name) return;
    onSaveEquipment(editingEquipment);
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringEquip || !transferToBranch) return;
    onTransferEquipment(
      transferringEquip.id,
      transferToBranch,
      transferReason,
      currentUser.name,
      transferCondition
    );
    setTransferringEquip(null);
    setTransferReason('');
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineForEquip || !newEventTitle) return;

    const newEvent: EquipmentTimelineEvent = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: newEventTitle,
      description: newEventDesc,
      type: newEventType,
      performedBy: currentUser.name,
      cost: newEventCost ? Number(newEventCost) : undefined,
    };

    const updatedEquip: Equipment = {
      ...newTimelineForEquip,
      timeline: [...newTimelineForEquip.timeline, newEvent],
    };

    onSaveEquipment(updatedEquip);
    setNewTimelineForEquip(null);
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventCost('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة الأسطول والمعدات الثقيلة</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل الآليات والحفارات والشيولات والشاحنات وساعات التشغيل والمناقلات بين الفروع
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewEquipmentModal}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة معدة جديدة</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث: رقم المعدة، الماركة، الموديل، المشغل، اللوحة..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة حالات المعدات</option>
            <option value="تعمل">تعمل</option>
            <option value="متوقفة">متوقفة</option>
            <option value="في الصيانة">في الصيانة</option>
            <option value="تحت الفحص">تحت الفحص</option>
            <option value="خارج الخدمة">خارج الخدمة</option>
          </select>
        </div>

        <div className="sm:col-span-3 flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة الأنواع</option>
            <option value="حفار">حفارات</option>
            <option value="بلدوزر">بلدوزرات</option>
            <option value="لودر">شيولات ولودرات</option>
            <option value="شاحنة">شاحنات وقلابات</option>
            <option value="دكاكة">دكاكات ورصاصات</option>
            <option value="مولد">مولدات صناعية</option>
          </select>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((equip) => {
          const branch = data.branches.find((b) => b.id === equip.branchId);

          return (
            <div
              key={equip.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {equip.equipmentNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      equip.status === 'تعمل'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : equip.status === 'في الصيانة' || equip.status === 'تحت الفحص'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {equip.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{equip.name}</h3>
                <div className="text-xs text-slate-400 mb-3">
                  <span>{equip.brand}</span> · <span>{equip.model}</span> (موديل {equip.manufactureYear})
                </div>

                {/* Key Technical Metadata Box */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الفرع التابع له:</span>
                    <span className="font-medium text-white">{branch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المشغل الحالي:</span>
                    <span className="text-slate-200">{equip.operatorName || 'بدون مشغل محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الموقع الميداني:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{equip.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ساعات التشغيل:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {equip.operatingHours.toLocaleString('ar-SA')} ساعة
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الصيانة القادمة:</span>
                    <span className="font-mono text-slate-300">{equip.nextMaintenanceDate}</span>
                  </div>
                  {equip.plateNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">اللوحة / الهيكل:</span>
                      <span className="font-mono text-slate-400">{equip.plateNumber}</span>
                    </div>
                  )}
                </div>

                {/* Quick Timeline Snippet */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>السجل التاريخي:</span>
                    <span className="text-amber-400 font-bold">{equip.timeline.length} أحداث مسجلة</span>
                  </div>
                  {equip.timeline.length > 0 && (
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      آخر حدث: {equip.timeline[equip.timeline.length - 1].title} (
                      {equip.timeline[equip.timeline.length - 1].date})
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onViewEquipmentHistory(equip.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-colors"
                  title="عرض السجل الزمني الكامل Timeline"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>تاريخ المعدة الكامل</span>
                </button>

                <div className="flex items-center gap-1">
                  {canManage && (
                    <>
                      <button
                        onClick={() => {
                          setNewTimelineForEquip(equip);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-emerald-400"
                        title="إضافة حدث جديد في تاريخ المعدة"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setTransferringEquip(equip);
                          setTransferToBranch(equip.branchId);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 text-indigo-300"
                        title="نقل المعدة لفرع آخر"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEquipment(equip);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`حذف المعدة ${equip.name}؟`)) onDeleteEquipment(equip.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Equipment Modal */}
      {transferringEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">نقل معدة بين الفروع</h3>
                <p className="text-xs text-amber-400">
                  {transferringEquip.name} ({transferringEquip.equipmentNumber})
                </p>
              </div>
              <button
                onClick={() => setTransferringEquip(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الفرع السابق الحالي</label>
                <input
                  type="text"
                  disabled
                  value={data.branches.find((b) => b.id === transferringEquip.branchId)?.name}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الفرع الجديد المستلم *</label>
                <select
                  required
                  value={transferToBranch}
                  onChange={(e) => setTransferToBranch(e.target.value)}
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
                <label className="block text-slate-400 mb-1">حالة المعدة عند النقل *</label>
                <select
                  value={transferCondition}
                  onChange={(e) =>
                    setTransferCondition(
                      e.target.value as 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ممتازة">ممتازة وجاهزة للعمل الفوري</option>
                  <option value="جيدة">جيدة</option>
                  <option value="تحتاج صيانة">تحتاج صيانة قبل التشغيل</option>
                  <option value="متوقفة">متوقفة ومعطلة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب أمر النقل *</label>
                <textarea
                  required
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="مثال: دعم مشاريع درء السيول ذات الأولوية بمكة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferringEquip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  إصدار أمر النقل وتوثيقه في التاريخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Timeline Event Modal */}
      {newTimelineForEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">إضافة حدث في السجل الزمني للمعدة</h3>
                <p className="text-xs text-amber-400">
                  {newTimelineForEquip.name} ({newTimelineForEquip.equipmentNumber})
                </p>
              </div>
              <button
                onClick={() => setNewTimelineForEquip(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">نوع الحدث *</label>
                <select
                  value={newEventType}
                  onChange={(e) =>
                    setNewEventType(e.target.value as EquipmentTimelineEvent['type'])
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="صيانة">صيانة دورية أو وقائية</option>
                  <option value="عطل">عطل مفاجئ أو توقف</option>
                  <option value="نقل">نقل بين المواقع والفروع</option>
                  <option value="فحص">فحص واختبار تشغيلي</option>
                  <option value="تشغيل">إعادة تشغيل بالميدان</option>
                  <option value="استلام">استلام أو إضافة ملحقات</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">عنوان الحدث *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="مثال: تغيير جنزير صخري وفحص الدفرنس"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">تفاصيل الحدث</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="شرح الأعمال التي تمت والقطع المستبدلة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">التكلفة (إن وجدت - ر.س)</label>
                <input
                  type="number"
                  value={newEventCost}
                  onChange={(e) => setNewEventCost(e.target.value)}
                  placeholder="مثال: 3500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTimelineForEquip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  إضافة للتاريخ الزمني
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isModalOpen && editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">بيانات المعدة / الآلية</h3>
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
                  <label className="block text-slate-400 mb-1">اسم المعدة *</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.name}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, name: e.target.value })
                    }
                    placeholder="مثال: حفار مجنزر كوماتسو PC390"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم المعدة *</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.equipmentNumber}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, equipmentNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الماركة *</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.brand}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, brand: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الموديل *</label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.model}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, model: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سنة الصنع</label>
                  <input
                    type="number"
                    value={editingEquipment.manufactureYear}
                    onChange={(e) =>
                      setEditingEquipment({
                        ...editingEquipment,
                        manufactureYear: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الرقم التسلسلي (الشاسيه)</label>
                  <input
                    type="text"
                    value={editingEquipment.serialNumber}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, serialNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم اللوحة (إن وجد)</label>
                  <input
                    type="text"
                    value={editingEquipment.plateNumber || ''}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, plateNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الفرع *</label>
                  <select
                    value={editingEquipment.branchId}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, branchId: e.target.value })
                    }
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
                  <label className="block text-slate-400 mb-1">حالة المعدة *</label>
                  <select
                    value={editingEquipment.status}
                    onChange={(e) =>
                      setEditingEquipment({
                        ...editingEquipment,
                        status: e.target.value as EquipmentStatus,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="تعمل">تعمل</option>
                    <option value="متوقفة">متوقفة</option>
                    <option value="في الصيانة">في الصيانة</option>
                    <option value="تحت الفحص">تحت الفحص</option>
                    <option value="خارج الخدمة">خارج الخدمة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم المشغل / السائق</label>
                  <input
                    type="text"
                    value={editingEquipment.operatorName}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, operatorName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ساعات التشغيل الحالية</label>
                  <input
                    type="number"
                    value={editingEquipment.operatingHours}
                    onChange={(e) =>
                      setEditingEquipment({
                        ...editingEquipment,
                        operatingHours: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">موقع المعدة الحالي</label>
                <input
                  type="text"
                  value={editingEquipment.location}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, location: e.target.value })
                  }
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
                  حفظ المعدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
