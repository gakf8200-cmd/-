import React, { useState } from 'react';
import { Worker, WorkerDocument, WorkerTransferRecord, SystemData, UserProfile } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Upload,
  ArrowRightLeft,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Briefcase,
  Building2,
  Layers,
  Shield,
  Eye,
  Calendar,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface WorkersViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveWorker: (worker: Worker) => void;
  onDeleteWorker: (workerId: string) => void;
  onTransferWorker: (
    workerId: string,
    toBranchId: string,
    toTeamId: string,
    reason: string
  ) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveWorker,
  onDeleteWorker,
  onTransferWorker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sponsorshipFilter, setSponsorshipFilter] = useState('ALL');
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [viewingWorker, setViewingWorker] = useState<Worker | null>(null);
  const [transferringWorker, setTransferringWorker] = useState<Worker | null>(null);
  const [transferBranch, setTransferBranch] = useState('');
  const [transferTeam, setTransferTeam] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Document upload state inside viewingWorker
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<WorkerDocument['type']>('إقامة');

  const canManage = canManageEntities(currentUser);

  const filteredWorkers = data.workers.filter((w) => {
    const matchesBranch = selectedBranchId === 'ALL' || w.branchId === selectedBranchId;
    const matchesSearch =
      w.fullName.includes(searchQuery) ||
      w.employeeNumber.includes(searchQuery) ||
      w.jobTitle.includes(searchQuery) ||
      w.phone.includes(searchQuery) ||
      w.nationality.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const matchesSponsorship =
      sponsorshipFilter === 'ALL' ||
      (sponsorshipFilter === 'company' && w.isCompanySponsorship) ||
      (sponsorshipFilter === 'outside' && !w.isCompanySponsorship);

    return matchesBranch && matchesSearch && matchesStatus && matchesSponsorship;
  });

  const openNewWorkerModal = () => {
    const defaultBranchId = selectedBranchId !== 'ALL' ? selectedBranchId : data.branches[0].id;
    const branchTeams = data.teams.filter((t) => t.branchId === defaultBranchId);

    setEditingWorker({
      id: 'wrk-' + Date.now(),
      employeeNumber: 'EMP-' + (data.workers.length + 1001),
      fullName: '',
      nationality: 'سعودي',
      jobTitle: 'مشغل معدات ثقيلة',
      phone: '05',
      branchId: defaultBranchId,
      teamId: branchTeams[0]?.id || data.teams[0]?.id,
      supervisor: '',
      status: 'على رأس العمل',
      hireDate: new Date().toISOString().split('T')[0],
      contractEndDate: '2028-01-01',
      residencyStatus: 'سارية',
      residencyExpiryDate: '2027-01-01',
      insuranceStatus: 'ساري',
      isCompanySponsorship: true,
      sponsorshipStartDate: new Date().toISOString().split('T')[0],
      documents: [],
      transferHistory: [],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker || !editingWorker.fullName) return;
    onSaveWorker(editingWorker);
    setIsModalOpen(false);
    setEditingWorker(null);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringWorker || !transferBranch) return;
    onTransferWorker(transferringWorker.id, transferBranch, transferTeam, transferReason);
    setTransferringWorker(null);
    setTransferReason('');
  };

  const handleUploadDocument = (worker: Worker) => {
    if (!newDocTitle) return;
    const newDoc: WorkerDocument = {
      id: 'doc-' + Date.now(),
      title: newDocTitle,
      type: newDocType,
      fileName: `${newDocType}_${worker.employeeNumber}.pdf`,
      uploadDate: new Date().toISOString().split('T')[0],
      size: '1.4 MB',
    };

    const updatedWorker: Worker = {
      ...worker,
      documents: [...worker.documents, newDoc],
    };
    onSaveWorker(updatedWorker);
    setViewingWorker(updatedWorker);
    setNewDocTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة شؤون العمالة والموظفين</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ملفات العمالة، الكفالات، الإقامات، عقود العمل، وسجل التنقلات التاريخي بين الفروع
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewWorkerModal}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عامل جديد</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث: اسم العامل، الرقم الوظيفي، المهنة، الجوال..."
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
            <option value="ALL">كافة حالات العمل</option>
            <option value="على رأس العمل">على رأس العمل</option>
            <option value="إجازة">إجازة</option>
            <option value="غياب">غياب</option>
            <option value="موقوف">موقوف</option>
            <option value="منقول">منقول</option>
            <option value="منتهي الخدمة">منتهي الخدمة</option>
          </select>
        </div>

        <div className="sm:col-span-3 flex items-center gap-2">
          <select
            value={sponsorshipFilter}
            onChange={(e) => setSponsorshipFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">كافة الكفالات</option>
            <option value="company">على كفالة الشركة</option>
            <option value="outside">خارج كفالة الشركة</option>
          </select>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-300">الرقم الوظيفي</th>
                <th className="py-3 px-3 font-semibold">اسم العامل</th>
                <th className="py-3 px-3 font-semibold">المهنة والجنسية</th>
                <th className="py-3 px-3 font-semibold">الفرع والفريق</th>
                <th className="py-3 px-3 font-semibold text-center">الكفالة</th>
                <th className="py-3 px-3 font-semibold text-center">الإقامة</th>
                <th className="py-3 px-3 font-semibold text-center">الحالة</th>
                <th className="py-3 px-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredWorkers.map((worker) => {
                const branch = data.branches.find((b) => b.id === worker.branchId);
                const team = data.teams.find((t) => t.id === worker.teamId);

                return (
                  <tr key={worker.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {worker.employeeNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{worker.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                        {worker.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200">{worker.jobTitle}</div>
                      <div className="text-[11px] text-slate-400">{worker.nationality}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-medium">{branch?.name}</div>
                      <div className="text-[11px] text-slate-400">{team?.name || 'بدون فريق'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          worker.isCompanySponsorship
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {worker.isCompanySponsorship ? 'كفالة الشركة' : 'خارج الكفالة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-medium ${
                          worker.residencyStatus === 'سارية'
                            ? 'text-emerald-400'
                            : worker.residencyStatus === 'قاربت على الانتهاء'
                            ? 'text-amber-400 font-bold'
                            : 'text-rose-400 font-bold'
                        }`}
                      >
                        {worker.residencyStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          worker.status === 'على رأس العمل'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : worker.status === 'إجازة'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingWorker(worker)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300"
                          title="الملف الكامل والمستندات والتنقلات"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setTransferringWorker(worker);
                                setTransferBranch(worker.branchId);
                                setTransferTeam(worker.teamId);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 text-indigo-300"
                              title="نقل العامل لفرع أو فريق آخر"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingWorker(worker);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`حذف العامل ${worker.fullName}؟`))
                                  onDeleteWorker(worker.id);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Worker Full File Modal */}
      {viewingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {viewingWorker.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{viewingWorker.fullName}</h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {viewingWorker.employeeNumber} · {viewingWorker.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingWorker(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              {/* Basic Worker Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">الجنسية</span>
                  <span className="text-white font-medium">{viewingWorker.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">رقم الجوال</span>
                  <span className="text-white font-mono" dir="ltr">{viewingWorker.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الفرع الحالي</span>
                  <span className="text-amber-300 font-medium">
                    {data.branches.find((b) => b.id === viewingWorker.branchId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الفريق والمشرف</span>
                  <span className="text-white">
                    {data.teams.find((t) => t.id === viewingWorker.teamId)?.name} · {viewingWorker.supervisor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">تاريخ المباشرة</span>
                  <span className="text-slate-200 font-mono">{viewingWorker.hireDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">انتهاء العقد</span>
                  <span className="text-slate-200 font-mono">{viewingWorker.contractEndDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">انتهاء الإقامة</span>
                  <span className="text-amber-400 font-mono">{viewingWorker.residencyExpiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الكفالة</span>
                  <span className="text-sky-300 font-semibold">
                    {viewingWorker.isCompanySponsorship ? 'على كفالة الشركة' : 'خارج الكفالة (أجير)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">حالة التأمين الصحي</span>
                  <span className="text-emerald-400">{viewingWorker.insuranceStatus}</span>
                </div>
              </div>

              {/* Historical Transfer Records (Unremovable) */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                  <span>السجل التاريخي لتنقلات العامل بين الفروع والفرق</span>
                </h4>
                {viewingWorker.transferHistory.length === 0 ? (
                  <p className="text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    لم يتم تسجيل أي تنقلات لهذا العامل، متواجد في موقعه الأساسي.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {viewingWorker.transferHistory.map((tr) => (
                      <div
                        key={tr.id}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-amber-400 font-bold">
                            من: {tr.fromBranch} ({tr.fromTeam}) ← إلى: {tr.toBranch} ({tr.toTeam})
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{tr.date}</span>
                        </div>
                        <p className="text-slate-300">السبب: {tr.reason}</p>
                        <p className="text-[10px] text-slate-500">معتمد بواسطة: {tr.approvedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Documents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>مستندات ومرفقات العامل (إقامة، عقد، جواز)</span>
                  </h4>
                </div>

                {viewingWorker.documents.length === 0 ? (
                  <p className="text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    لا توجد مستندات مرفوعة بعد. يمكنك رفع وثائق العامل أدناه.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {viewingWorker.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="font-bold text-white text-[11px]">{doc.title}</div>
                            <div className="text-[10px] text-slate-400">
                              {doc.type} · {doc.uploadDate}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {doc.size || '1.2 MB'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Form */}
                {canManage && (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2">
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="عنوان المستند الجديد (مثال: صورة الجواز المحدث)..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as WorkerDocument['type'])}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="إقامة">إقامة</option>
                      <option value="عقد">عقد</option>
                      <option value="جواز سفر">جواز سفر</option>
                      <option value="رخصة قيادة معدات">رخصة قيادة معدات</option>
                      <option value="تأمين">تأمين</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                    <button
                      onClick={() => handleUploadDocument(viewingWorker)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع المستند</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Worker Modal */}
      {transferringWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">نقل عامل بين الفرق والفروع</h3>
                <p className="text-xs text-amber-400">{transferringWorker.fullName}</p>
              </div>
              <button
                onClick={() => setTransferringWorker(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الفرع الجديد *</label>
                <select
                  required
                  value={transferBranch}
                  onChange={(e) => {
                    setTransferBranch(e.target.value);
                    const bTeams = data.teams.filter((t) => t.branchId === e.target.value);
                    if (bTeams.length > 0) setTransferTeam(bTeams[0].id);
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
                  value={transferTeam}
                  onChange={(e) => setTransferTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {data.teams
                    .filter((t) => t.branchId === transferBranch)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب النقل والمناقلة *</label>
                <textarea
                  required
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="مثال: حاجة عاجلة لمشغل بوكلين في مشروع تصريف السيول..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferringWorker(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  تأكيد النقل وتحديث السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Worker Modal */}
      {isModalOpen && editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">بيانات العامل / الموظف</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الاسم الكامل للعامل *</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.fullName}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, fullName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الرقم الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.employeeNumber}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, employeeNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الجنسية *</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.nationality}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, nationality: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المهنة *</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.jobTitle}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, jobTitle: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الجوال *</label>
                  <input
                    type="text"
                    required
                    value={editingWorker.phone}
                    onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الفرع *</label>
                  <select
                    value={editingWorker.branchId}
                    onChange={(e) => {
                      const newB = e.target.value;
                      const bTeams = data.teams.filter((t) => t.branchId === newB);
                      setEditingWorker({
                        ...editingWorker,
                        branchId: newB,
                        teamId: bTeams[0]?.id || '',
                      });
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
                  <label className="block text-slate-400 mb-1">الفريق *</label>
                  <select
                    value={editingWorker.teamId}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, teamId: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {data.teams
                      .filter((t) => t.branchId === editingWorker.branchId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">حالة العامل *</label>
                  <select
                    value={editingWorker.status}
                    onChange={(e) =>
                      setEditingWorker({
                        ...editingWorker,
                        status: e.target.value as Worker['status'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="على رأس العمل">على رأس العمل</option>
                    <option value="إجازة">إجازة</option>
                    <option value="غياب">غياب</option>
                    <option value="موقوف">موقوف</option>
                    <option value="منقول">منقول</option>
                    <option value="منتهي الخدمة">منتهي الخدمة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">حالة الإقامة</label>
                  <select
                    value={editingWorker.residencyStatus}
                    onChange={(e) =>
                      setEditingWorker({
                        ...editingWorker,
                        residencyStatus: e.target.value as Worker['residencyStatus'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="سارية">سارية</option>
                    <option value="قاربت على الانتهاء">قاربت على الانتهاء</option>
                    <option value="منتهية">منتهية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">كفالة الشركة؟</label>
                  <select
                    value={editingWorker.isCompanySponsorship ? 'yes' : 'no'}
                    onChange={(e) =>
                      setEditingWorker({
                        ...editingWorker,
                        isCompanySponsorship: e.target.value === 'yes',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="yes">نعم (على كفالة الشركة)</option>
                    <option value="no">لا (خارج الكفالة / أجير)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ انتهاء الإقامة</label>
                  <input
                    type="date"
                    value={editingWorker.residencyExpiryDate}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, residencyExpiryDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ انتهاء العقد</label>
                  <input
                    type="date"
                    value={editingWorker.contractEndDate}
                    onChange={(e) =>
                      setEditingWorker({ ...editingWorker, contractEndDate: e.target.value })
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
                  حفظ بيانات العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
