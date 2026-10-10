import React, { useState } from 'react';
import {
  MaintenanceReport,
  MaintenanceStageRecord,
  MaintenancePartItem,
  SystemData,
  UserProfile,
  PriorityLevel,
} from '../types';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  DollarSign,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Building2,
  Trash2,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';
import { printReport } from '../utils/exportUtils';

interface MaintenanceViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveReport: (report: MaintenanceReport) => void;
  onDeleteReport: (reportId: string) => void;
}

const DEFAULT_10_STAGES = [
  '1. تم تسجيل البلاغ',
  '2. تحت الفحص',
  '3. تم تحديد العطل',
  '4. بانتظار قطع الغيار',
  '5. جاري الإصلاح',
  '6. تم الإصلاح',
  '7. تحت الاختبار',
  '8. جاهزة للتشغيل',
  '9. عادت للعمل',
  '10. تم إغلاق البلاغ',
];

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveReport,
  onDeleteReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<MaintenanceReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  // Stage transition note
  const [stageNotes, setStageNotes] = useState('');

  // Spare part addition inside ticket
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Cost inputs
  const [editCostsMode, setEditCostsMode] = useState(false);
  const [laborCostInput, setLaborCostInput] = useState(0);
  const [workshopCostInput, setWorkshopCostInput] = useState(0);
  const [otherCostInput, setOtherCostInput] = useState(0);

  // New Ticket State
  const [newEquipId, setNewEquipId] = useState('');
  const [newFaultType, setNewFaultType] = useState('عطل ميكانيكي / هيدروليك');
  const [newFaultDesc, setNewFaultDesc] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('مرتفع');

  const canManage = canManageEntities(currentUser);

  const filteredReports = data.maintenanceReports.filter((r) => {
    const matchesBranch = selectedBranchId === 'ALL' || r.branchId === selectedBranchId;
    const matchesSearch =
      r.reportNumber.includes(searchQuery) ||
      r.equipmentName.includes(searchQuery) ||
      r.equipmentNumber.includes(searchQuery) ||
      r.faultType.includes(searchQuery) ||
      r.description.includes(searchQuery);
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesBranch && matchesSearch && matchesPriority && matchesStatus;
  });

  const activeTicket = selectedReport || filteredReports[0] || null;

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const equip = data.equipment.find((x) => x.id === newEquipId);
    if (!equip) return;

    const stages: MaintenanceStageRecord[] = DEFAULT_10_STAGES.map((name, idx) => ({
      stageIndex: idx,
      stageName: name,
      timestamp: idx === 0 ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      completedBy: idx === 0 ? currentUser.name : undefined,
      notes: idx === 0 ? 'تم تسجيل البلاغ وإشعار ورشة الصيانة' : '',
      isCompleted: idx === 0,
    }));

    const newRep: MaintenanceReport = {
      id: 'rep-' + Date.now(),
      reportNumber: 'REP-' + new Date().getFullYear() + '-0' + (data.maintenanceReports.length + 80),
      equipmentId: equip.id,
      equipmentNumber: equip.equipmentNumber,
      equipmentName: equip.name,
      branchId: equip.branchId,
      teamId: equip.teamId,
      projectId: equip.projectId,
      reportDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reporterName: currentUser.name,
      faultType: newFaultType,
      description: newFaultDesc,
      priority: newPriority,
      currentStageIndex: 0,
      stagesHistory: stages,
      sparePartsUsed: [],
      partsCost: 0,
      laborCost: 0,
      workshopCost: 0,
      otherCost: 0,
      totalCost: 0,
      status: 'مفتوح',
      downtimeHours: 0,
    };

    onSaveReport(newRep);
    setIsNewReportModalOpen(false);
    setSelectedReport(newRep);
    setNewFaultDesc('');
  };

  const handleAdvanceStage = (ticket: MaintenanceReport) => {
    if (ticket.currentStageIndex >= 9) return;
    const nextIdx = ticket.currentStageIndex + 1;

    const updatedStages = [...ticket.stagesHistory];
    updatedStages[nextIdx] = {
      ...updatedStages[nextIdx],
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completedBy: currentUser.name,
      notes: stageNotes || `تم الانتقال للمرحلة: ${DEFAULT_10_STAGES[nextIdx]}`,
      isCompleted: true,
    };

    const isClosed = nextIdx === 9;

    const updatedReport: MaintenanceReport = {
      ...ticket,
      currentStageIndex: nextIdx,
      stagesHistory: updatedStages,
      status: isClosed ? 'مكتمل' : 'قيد التنفيذ',
      closedAt: isClosed
        ? new Date().toISOString().replace('T', ' ').substring(0, 16)
        : undefined,
    };

    onSaveReport(updatedReport);
    setSelectedReport(updatedReport);
    setStageNotes('');
  };

  const handleAddPartToReport = (ticket: MaintenanceReport) => {
    const part = data.spareParts.find((p) => p.id === selectedPartId);
    if (!part || partQty <= 0) return;

    const item: MaintenancePartItem = {
      id: 'item-' + Date.now(),
      partId: part.id,
      partName: part.name,
      partNumber: part.partNumber,
      quantity: Number(partQty),
      unitPrice: part.unitPrice,
      totalPrice: part.unitPrice * Number(partQty),
    };

    const newPartsUsed = [...ticket.sparePartsUsed, item];
    const newPartsCost = newPartsUsed.reduce((acc, p) => acc + p.totalPrice, 0);
    const newTotal =
      newPartsCost + ticket.laborCost + ticket.workshopCost + ticket.otherCost;

    const updatedReport: MaintenanceReport = {
      ...ticket,
      sparePartsUsed: newPartsUsed,
      partsCost: newPartsCost,
      totalCost: newTotal,
    };

    onSaveReport(updatedReport);
    setSelectedReport(updatedReport);
    setSelectedPartId('');
    setPartQty(1);
  };

  const handleSaveCosts = (ticket: MaintenanceReport) => {
    const newPartsCost = ticket.partsCost;
    const newTotal =
      newPartsCost + Number(laborCostInput) + Number(workshopCostInput) + Number(otherCostInput);

    const updatedReport: MaintenanceReport = {
      ...ticket,
      laborCost: Number(laborCostInput),
      workshopCost: Number(workshopCostInput),
      otherCost: Number(otherCostInput),
      totalCost: newTotal,
    };

    onSaveReport(updatedReport);
    setSelectedReport(updatedReport);
    setEditCostsMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              نظام بلاغات الأعطال ومراحل الإصلاح العشرة (10 مراحل)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل الأعطال، تتبع مراحل الإصلاح خطوة بخطوة، قطع الغيار المستهلكة، وحساب التكاليف بدقة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => {
                if (data.equipment.length > 0) {
                  setNewEquipId(data.equipment[0].id);
                }
                setIsNewReportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل بلاغ عطل جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث: رقم البلاغ، المعدة، نوع العطل..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pr-8 pl-3 text-xs text-white placeholder:text-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="flex gap-2 text-xs">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-slate-300 text-xs"
              >
                <option value="ALL">كافة الأولويات</option>
                <option value="عاجل">عاجل</option>
                <option value="مرتفع">مرتفع</option>
                <option value="متوسط">متوسط</option>
                <option value="منخفض">منخفض</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-slate-300 text-xs"
              >
                <option value="ALL">كافة الحالات</option>
                <option value="مفتوح">مفتوح</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-2.5 max-h-[680px] overflow-y-auto">
            {filteredReports.map((report) => {
              const isSelected = activeTicket?.id === report.id;
              const branch = data.branches.find((b) => b.id === report.branchId);

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-amber-400 font-bold">{report.reportNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                          report.priority === 'عاجل'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {report.priority}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{branch?.name}</span>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1">
                    {report.equipmentName}{' '}
                    <span className="text-slate-400 font-mono">({report.equipmentNumber})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
                    {report.description}
                  </p>

                  {/* Stage Progress summary */}
                  <div className="flex items-center justify-between text-[11px] border-t border-slate-850 pt-2 text-slate-400">
                    <span className="text-amber-300 font-medium truncate max-w-[170px]">
                      {report.stagesHistory[report.currentStageIndex]?.stageName}
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {report.currentStageIndex + 1} / 10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket 10-Stage Detailed Workflow */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              {/* Ticket Top Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-amber-400">
                      {activeTicket.reportNumber}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        activeTicket.status === 'مكتمل'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {activeTicket.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeTicket.equipmentName} ({activeTicket.equipmentNumber})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تاريخ البلاغ: {activeTicket.reportDate} · المبلغ: {activeTicket.reporterName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      printReport(
                        `تقرير صيانة ${activeTicket.equipmentName} - ${activeTicket.reportNumber}`
                      )
                    }
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    title="طباعة تقرير البلاغ"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                  </button>
                  {canManage && (
                    <button
                      onClick={() => {
                        if (confirm(`حذف بلاغ الصيانة ${activeTicket.reportNumber}؟`)) {
                          onDeleteReport(activeTicket.id);
                          setSelectedReport(null);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Fault Description Box */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-850 text-xs">
                <span className="text-slate-400 block mb-1 font-semibold">
                  نوع العطل والتوصيف الفني: ({activeTicket.faultType})
                </span>
                <p className="text-slate-200 leading-relaxed">{activeTicket.description}</p>
              </div>

              {/* The 10-Stages Interactive Sequential Stepper */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>مراحل الإصلاح العشرة المعتمدة بالترتيب</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-bold font-mono">
                    المرحلة {activeTicket.currentStageIndex + 1} من 10
                  </span>
                </div>

                <div className="space-y-2">
                  {DEFAULT_10_STAGES.map((stageName, idx) => {
                    const stageRecord = activeTicket.stagesHistory[idx];
                    const isDone = idx < activeTicket.currentStageIndex;
                    const isCurrent = idx === activeTicket.currentStageIndex;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40'
                            : isDone
                            ? 'bg-slate-950/60 border-emerald-500/30'
                            : 'bg-slate-950/30 border-slate-850 text-slate-500'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                              isDone
                                ? 'bg-emerald-500 text-slate-950'
                                : isCurrent
                                ? 'bg-amber-400 text-slate-950 animate-pulse'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>

                          <div>
                            <div
                              className={`font-bold ${
                                isCurrent
                                  ? 'text-amber-300'
                                  : isDone
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {stageName}
                            </div>
                            {stageRecord?.notes && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {stageRecord.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {stageRecord?.timestamp && (
                          <div className="text-left shrink-0 text-[10px] text-slate-400">
                            <span className="font-mono text-amber-400 block">{stageRecord.timestamp}</span>
                            <span>{stageRecord.completedBy}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Advance Stage Control */}
                {canManage && activeTicket.currentStageIndex < 9 && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>
                        الانتقال إلى المرحلة التالية: (
                        {DEFAULT_10_STAGES[activeTicket.currentStageIndex + 1]})
                      </span>
                    </div>

                    <input
                      type="text"
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      placeholder="أدخل ملاحظات المرحلة الجديدة (فحص القطع، اكتمال التجميع، إلخ)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />

                    <button
                      onClick={() => handleAdvanceStage(activeTicket)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وتحديث المرحلة ({DEFAULT_10_STAGES[activeTicket.currentStageIndex + 1]})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Spare Parts Linked to Ticket */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-sky-400" />
                    <span>قطع الغيار المستهلكة في هذا البلاغ</span>
                  </h4>
                  <span className="font-mono text-xs text-sky-300 font-bold">
                    إجمالي القطع: {activeTicket.partsCost.toLocaleString('ar-SA')} ر.س
                  </span>
                </div>

                {activeTicket.sparePartsUsed.length === 0 ? (
                  <p className="text-slate-500 bg-slate-950 p-3 rounded-xl text-xs mb-3">
                    لم يتم تسجيل أي قطع غيار مستهلكة حتى الآن.
                  </p>
                ) : (
                  <div className="space-y-1.5 mb-3 text-xs">
                    {activeTicket.sparePartsUsed.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white">{p.partName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            كود: {p.partNumber} · الكمية: {p.quantity} × {p.unitPrice} ر.س
                          </span>
                        </div>
                        <span className="font-mono font-bold text-sky-300">
                          {p.totalPrice.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Part to Ticket */}
                {canManage && (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center gap-2 text-xs">
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    >
                      <option value="">-- اختر قطعة غيار من المستودع --</option>
                      {data.spareParts.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} ({sp.unitPrice} ر.س) - متوفر: {sp.quantityInStock}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={partQty}
                      onChange={(e) => setPartQty(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono text-center text-xs"
                      title="الكمية"
                    />
                    <button
                      onClick={() => handleAddPartToReport(activeTicket)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs shrink-0"
                    >
                      إضافة للبلاغ
                    </button>
                  </div>
                )}
              </div>

              {/* Maintenance Costs Summary & Breakdown */}
              <div className="pt-4 border-t border-slate-800 bg-slate-950/70 p-4 rounded-2xl border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>تفصيل تكاليف الإصلاح والمصروفات</span>
                  </h4>
                  {canManage && !editCostsMode && (
                    <button
                      onClick={() => {
                        setLaborCostInput(activeTicket.laborCost);
                        setWorkshopCostInput(activeTicket.workshopCost);
                        setOtherCostInput(activeTicket.otherCost);
                        setEditCostsMode(true);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      تعديل التكاليف
                    </button>
                  )}
                </div>

                {editCostsMode ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">أجور عمالة/فنيين</label>
                        <input
                          type="number"
                          value={laborCostInput}
                          onChange={(e) => setLaborCostInput(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">أجور ورشة خارجية</label>
                        <input
                          type="number"
                          value={workshopCostInput}
                          onChange={(e) => setWorkshopCostInput(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">مصروفات أخرى/نقل</label>
                        <input
                          type="number"
                          value={otherCostInput}
                          onChange={(e) => setOtherCostInput(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditCostsMode(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveCosts(activeTicket)}
                        className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold"
                      >
                        حفظ التكاليف
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-850">
                      <span className="text-slate-400 block text-[11px]">قطع الغيار</span>
                      <span className="font-mono font-bold text-white">
                        {activeTicket.partsCost.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-850">
                      <span className="text-slate-400 block text-[11px]">أجور الفنيين</span>
                      <span className="font-mono font-bold text-white">
                        {activeTicket.laborCost.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-850">
                      <span className="text-slate-400 block text-[11px]">الورشة والمخارط</span>
                      <span className="font-mono font-bold text-white">
                        {activeTicket.workshopCost.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      <span className="text-amber-400 block text-[11px] font-bold">
                        إجمالي تكلفة البلاغ
                      </span>
                      <span className="font-mono font-extrabold text-amber-300 text-sm">
                        {activeTicket.totalCost.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">اختر بلاغ صيانة من القائمة لعرض مراحل الإصلاح العشرة والتكاليف</p>
            </div>
          )}
        </div>
      </div>

      {/* New Fault Report Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm">تسجيل بلاغ عطل وصيانة جديد</h3>
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">المعدة المتعطلة *</label>
                <select
                  required
                  value={newEquipId}
                  onChange={(e) => setNewEquipId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentNumber} - {eq.name} ({eq.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع العطل *</label>
                  <select
                    value={newFaultType}
                    onChange={(e) => setNewFaultType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="عطل ميكانيكي / هيدروليك">عطل ميكانيكي / هيدروليك</option>
                    <option value="عطل في المحرك">عطل في المحرك</option>
                    <option value="كهرباء وضفيرة">كهرباء وضفيرة</option>
                    <option value="أنظمة الفرامل">أنظمة الفرامل</option>
                    <option value="شروخ وهياكل">شروخ وهياكل</option>
                    <option value="صيانة وقائية دورية">صيانة وقائية دورية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">درجة الأولوية *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="عاجل">عاجل (توقف فوري للمشروع)</option>
                    <option value="مرتفع">مرتفع</option>
                    <option value="متوسط">متوسط</option>
                    <option value="منخفض">منخفض</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">وصف العطل بالتفصيل *</label>
                <textarea
                  required
                  rows={3}
                  value={newFaultDesc}
                  onChange={(e) => setNewFaultDesc(e.target.value)}
                  placeholder="وصف الأعراض، تسريب الزيوت، الأصوات، أو التوقف المفاجئ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  فتح البلاغ وبدء المرحلة الأولى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
