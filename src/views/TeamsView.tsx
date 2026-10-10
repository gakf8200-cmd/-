import React, { useState } from 'react';
import { Team, SystemData, UserProfile } from '../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  Truck,
  Building2,
  MapPin,
  Calendar,
  X,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface TeamsViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveTeam,
  onDeleteTeam,
}) => {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const canManage = canManageEntities(currentUser);

  const filteredTeams = data.teams.filter((t) => {
    const matchesBranch = selectedBranchId === 'ALL' || t.branchId === selectedBranchId;
    const matchesSearch =
      t.name.includes(searchQuery) ||
      t.teamNumber.includes(searchQuery) ||
      t.supervisor.includes(searchQuery) ||
      t.workType.includes(searchQuery);
    return matchesBranch && matchesSearch;
  });

  const openNewTeamModal = () => {
    setEditingTeam({
      id: 'team-' + Date.now(),
      teamNumber: 'TM-' + (data.teams.length + 101),
      name: '',
      branchId: selectedBranchId !== 'ALL' ? selectedBranchId : data.branches[0].id,
      projectId: data.projects[0]?.id,
      supervisor: '',
      workType: 'أعمال حفر وقنوات رئيسية',
      location: '',
      workersCount: 15,
      status: 'ميداني نشط',
      createdAt: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.name) return;
    onSaveTeam(editingTeam);
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة الفرق التشغيلية الميدانية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة فرق العمل الميدانية ومسؤوليها وتوزيع العمال والمعدات التابعة لكل فريق
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewTeamModal}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فريق ميداني</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الفريق، اسم الفريق، المشرف، نوع العمل..."
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
        <div className="text-xs text-slate-400">
          عدد الفرق: <span className="font-bold text-white">{filteredTeams.length}</span>
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const branch = data.branches.find((b) => b.id === team.branchId);
          const project = data.projects.find((p) => p.id === team.projectId);
          const teamWorkers = data.workers.filter((w) => w.teamId === team.id);
          const teamEquipment = data.equipment.filter((e) => e.teamId === team.id);

          return (
            <div
              key={team.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {team.teamNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                    {team.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{team.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{team.workType}</p>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الفرع:</span>
                    <span className="font-medium text-white">{branch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المشرف المسؤول:</span>
                    <span className="text-amber-300 font-semibold">{team.supervisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الموقع / المشروع:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">
                      {project ? project.name : team.location}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">العمالة المسجلة</span>
                    <span className="text-sky-400 font-bold text-sm">
                      {teamWorkers.length > 0 ? teamWorkers.length : team.workersCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">المعدات الملحقة</span>
                    <span className="text-emerald-400 font-bold text-sm">{teamEquipment.length}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-2 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingTeam(team)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض عمال ومعدات الفريق</span>
                </button>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTeam(team);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف الفريق ${team.name}؟`)) onDeleteTeam(team.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View Team Details Drawer / Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <span className="text-xs text-amber-400 font-mono">{viewingTeam.teamNumber}</span>
                <h3 className="text-base font-bold text-white">{viewingTeam.name}</h3>
              </div>
              <button
                onClick={() => setViewingTeam(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              {/* Workers list inside team */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>العمال التابعون لهذا الفريق</span>
                </h4>
                {data.workers.filter((w) => w.teamId === viewingTeam.id).length === 0 ? (
                  <p className="text-slate-500 bg-slate-950 p-3 rounded-xl">
                    لا يوجد عمال مرتبطون بهذا الفريق حالياً.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.workers
                      .filter((w) => w.teamId === viewingTeam.id)
                      .map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {w.fullName}{' '}
                              <span className="text-[10px] text-amber-400 font-mono">
                                ({w.employeeNumber})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {w.jobTitle} · {w.nationality}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400">
                            {w.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Equipment list inside team */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>المعدات والآليات المسندة للفريق</span>
                </h4>
                {data.equipment.filter((e) => e.teamId === viewingTeam.id).length === 0 ? (
                  <p className="text-slate-500 bg-slate-950 p-3 rounded-xl">
                    لا توجد معدات مسندة لهذا الفريق حالياً.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.equipment
                      .filter((e) => e.teamId === viewingTeam.id)
                      .map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {e.name}{' '}
                              <span className="text-[10px] text-amber-400 font-mono">
                                ({e.equipmentNumber})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              المشغل: {e.operatorName} · الموقع: {e.location}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300">
                            {e.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {isModalOpen && editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">بيانات الفريق الميداني</h3>
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
                  <label className="block text-slate-400 mb-1">اسم الفريق *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الفريق *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.teamNumber}
                    onChange={(e) => setEditingTeam({ ...editingTeam, teamNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الفرع التابع له *</label>
                  <select
                    value={editingTeam.branchId}
                    onChange={(e) => setEditingTeam({ ...editingTeam, branchId: e.target.value })}
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
                  <label className="block text-slate-400 mb-1">المشرف المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.supervisor}
                    onChange={(e) =>
                      setEditingTeam({ ...editingTeam, supervisor: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع العمل</label>
                  <input
                    type="text"
                    value={editingTeam.workType}
                    onChange={(e) => setEditingTeam({ ...editingTeam, workType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">موقع العمل الميداني</label>
                  <input
                    type="text"
                    value={editingTeam.location}
                    onChange={(e) => setEditingTeam({ ...editingTeam, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المشروع المرتبط</label>
                  <select
                    value={editingTeam.projectId || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">بدون مشروع محدد</option>
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">حالة الفريق</label>
                  <select
                    value={editingTeam.status}
                    onChange={(e) =>
                      setEditingTeam({
                        ...editingTeam,
                        status: e.target.value as Team['status'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ميداني نشط">ميداني نشط</option>
                    <option value="في الموقع">في الموقع</option>
                    <option value="في وضع الاستعداد">في وضع الاستعداد</option>
                    <option value="معلق">معلق</option>
                  </select>
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
                  حفظ الفريق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
