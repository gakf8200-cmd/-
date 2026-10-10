import React, { useState } from 'react';
import { Equipment, EquipmentTimelineEvent, SystemData, UserProfile } from '../types';
import {
  History,
  Truck,
  Plus,
  Calendar,
  Wrench,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  DollarSign,
  Printer,
  X,
  Building2,
} from 'lucide-react';
import { printReport } from '../utils/exportUtils';
import { canManageEntities } from '../utils/storage';

interface EquipmentHistoryViewProps {
  data: SystemData;
  selectedEquipmentId?: string;
  currentUser: UserProfile;
  onSaveEquipment: (equipment: Equipment) => void;
}

export const EquipmentHistoryView: React.FC<EquipmentHistoryViewProps> = ({
  data,
  selectedEquipmentId,
  currentUser,
  onSaveEquipment,
}) => {
  const [currentId, setCurrentId] = useState<string>(
    selectedEquipmentId || data.equipment[0]?.id || ''
  );
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // New Event Form State
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<EquipmentTimelineEvent['type']>('صيانة');
  const [eventCost, setEventCost] = useState('');
  const [eventRef, setEventRef] = useState('');

  const canManage = canManageEntities(currentUser);

  const selectedEquipment = data.equipment.find((e) => e.id === currentId) || data.equipment[0];
  const branch = data.branches.find((b) => b.id === selectedEquipment?.branchId);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !eventTitle) return;

    const newEvent: EquipmentTimelineEvent = {
      id: 'tl-' + Date.now(),
      date: eventDate,
      title: eventTitle,
      description: eventDescription,
      type: eventType,
      performedBy: currentUser.name,
      cost: eventCost ? Number(eventCost) : undefined,
      referenceNumber: eventRef || undefined,
    };

    const updatedEquipment: Equipment = {
      ...selectedEquipment,
      timeline: [...selectedEquipment.timeline, newEvent],
    };

    onSaveEquipment(updatedEquipment);
    setIsAddEventModalOpen(false);
    setEventTitle('');
    setEventDescription('');
    setEventCost('');
    setEventRef('');
  };

  const getEventBadge = (type: EquipmentTimelineEvent['type']) => {
    switch (type) {
      case 'استلام':
        return {
          bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: Truck,
          color: 'text-sky-400',
        };
      case 'عطل':
        return {
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: AlertTriangle,
          color: 'text-rose-400',
        };
      case 'صيانة':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: Wrench,
          color: 'text-amber-400',
        };
      case 'نقل':
        return {
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          icon: ArrowRightLeft,
          color: 'text-purple-400',
        };
      case 'تشغيل':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          color: 'text-emerald-400',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: History,
          color: 'text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Equipment Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">السجل التاريخي الشامل للمعدة (Timeline)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تتبع زمني كامل لكافة الأحداث منذ تاريخ استلام المعدة، أعمال الصيانة، الأعطال، والتنقلات بين الفروع
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Select Equipment Dropdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {data.equipment.map((e) => (
                <option key={e.id} value={e.id} className="bg-slate-900">
                  {e.equipmentNumber} - {e.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              printReport(
                `السجل التاريخي للمعدة ${selectedEquipment?.name} - ${selectedEquipment?.equipmentNumber}`
              )
            }
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة السجل</span>
          </button>

          {canManage && (
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل حدث تاريخي</span>
            </button>
          )}
        </div>
      </div>

      {selectedEquipment && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Equipment Summary Overview Card */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                {selectedEquipment.equipmentNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                {selectedEquipment.status}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-white">{selectedEquipment.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedEquipment.brand} · {selectedEquipment.model} ({selectedEquipment.manufactureYear})
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-850">
              <div className="flex justify-between">
                <span className="text-slate-400">الفرع الحالي:</span>
                <span className="font-bold text-white">{branch?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الموقع الحالي:</span>
                <span className="text-slate-200">{selectedEquipment.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المشغل المعتمد:</span>
                <span className="text-amber-300 font-medium">
                  {selectedEquipment.operatorName || 'بدون مشغل'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ساعات التشغيل:</span>
                <span className="font-mono text-white font-bold">
                  {selectedEquipment.operatingHours.toLocaleString('ar-SA')} ساعة
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ دخول الشركة:</span>
                <span className="font-mono text-slate-300">{selectedEquipment.entryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الرقم التسلسلي:</span>
                <span className="font-mono text-slate-400">{selectedEquipment.serialNumber}</span>
              </div>
              {selectedEquipment.plateNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم اللوحة:</span>
                  <span className="font-mono text-slate-300">{selectedEquipment.plateNumber}</span>
                </div>
              )}
            </div>

            {/* Total maintenance cost computed from timeline */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">
                إجمالي تكاليف الصيانة المسجلة بالتاريخ
              </span>
              <span className="text-lg font-black text-amber-400">
                {selectedEquipment.timeline
                  .reduce((sum, ev) => sum + (ev.cost || 0), 0)
                  .toLocaleString('ar-SA')}{' '}
                ر.س
              </span>
            </div>
          </div>

          {/* Visual Vertical Timeline of Events */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>التسلسل الزمني لأحداث المعدة</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {selectedEquipment.timeline.length} محطات تاريخية
              </span>
            </div>

            {selectedEquipment.timeline.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                لا توجد أحداث مسجلة في تاريخ هذه المعدة بعد.
              </div>
            ) : (
              <div className="relative pr-6 border-r-2 border-slate-800 space-y-6 mr-3">
                {selectedEquipment.timeline.map((event, index) => {
                  const badge = getEventBadge(event.type);
                  const Icon = badge.icon;

                  return (
                    <div key={event.id || index} className="relative group">
                      {/* Timeline dot circle */}
                      <div
                        className={`absolute -right-[33px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 flex items-center justify-center ${
                          badge.color === 'text-sky-400'
                            ? 'border-sky-500'
                            : badge.color === 'text-rose-400'
                            ? 'border-rose-500'
                            : badge.color === 'text-amber-400'
                            ? 'border-amber-500'
                            : 'border-emerald-500'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            badge.color === 'text-sky-400'
                              ? 'bg-sky-400'
                              : badge.color === 'text-rose-400'
                              ? 'bg-rose-400'
                              : badge.color === 'text-amber-400'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>

                      {/* Event Content Card */}
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${badge.bg}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{event.type}</span>
                            </span>
                            <h4 className="font-bold text-white text-sm">{event.title}</h4>
                          </div>
                          <span className="font-mono text-xs text-amber-400 font-semibold shrink-0">
                            {event.date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-850">
                          <div>
                            المسؤول / الفني: <span className="text-slate-200">{event.performedBy}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {event.referenceNumber && (
                              <span className="font-mono text-slate-400">
                                مرجع: {event.referenceNumber}
                              </span>
                            )}
                            {event.cost !== undefined && event.cost > 0 && (
                              <span className="font-bold text-amber-400 font-mono">
                                التكلفة: {event.cost.toLocaleString('ar-SA')} ر.س
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventModalOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">تسجيل حدث في تاريخ المعدة</h3>
                <p className="text-xs text-amber-400">
                  {selectedEquipment.name} ({selectedEquipment.equipmentNumber})
                </p>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الحدث *</label>
                  <select
                    value={eventType}
                    onChange={(e) =>
                      setEventType(e.target.value as EquipmentTimelineEvent['type'])
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="صيانة">صيانة دورية / وقائية</option>
                    <option value="عطل">عطل أو تلف مفاجئ</option>
                    <option value="نقل">نقل بين الفروع والمشاريع</option>
                    <option value="فحص">دخول ورشة فحص واختبار</option>
                    <option value="تشغيل">انتهاء الإصلاح وعودة للعمل</option>
                    <option value="استلام">استلام أو إضافة ملحق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ الحدث *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">عنوان الحدث *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="مثال: تغيير جنزير صخري وفحص الدفرنس"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">تفاصيل الحدث</label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="وصف الإجراء أو الفحص الذي تم..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة (ر.س إن وجدت)</label>
                  <input
                    type="number"
                    value={eventCost}
                    onChange={(e) => setEventCost(e.target.value)}
                    placeholder="مثال: 5400"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم مرجعي / أمر الشراء</label>
                  <input
                    type="text"
                    value={eventRef}
                    onChange={(e) => setEventRef(e.target.value)}
                    placeholder="PO-2026-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  حفظ في السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
