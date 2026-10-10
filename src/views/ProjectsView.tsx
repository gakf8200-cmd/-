import React, { useState } from 'react';
import { Project, SystemData, UserProfile } from '../types';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  Users,
  Layers,
  Truck,
  X,
  CheckCircle2,
} from 'lucide-react';
import { canManageEntities } from '../utils/storage';

interface ProjectsViewProps {
  data: SystemData;
  selectedBranchId: string;
  currentUser: UserProfile;
  onSaveProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  data,
  selectedBranchId,
  currentUser,
  onSaveProject,
  onDeleteProject,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const canManage = canManageEntities(currentUser);

  const filteredProjects = data.projects.filter((p) => {
    const matchesBranch = selectedBranchId === 'ALL' || p.branchId === selectedBranchId;
    const matchesSearch =
      p.name.includes(searchQuery) ||
      p.projectNumber.includes(searchQuery) ||
      p.client.includes(searchQuery) ||
      p.location.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesBranch && matchesSearch && matchesStatus;
  });

  const openNewProjectModal = () => {
    setEditingProject({
      id: 'proj-' + Date.now(),
      projectNumber: 'PRJ-' + new Date().getFullYear() + '-0' + (data.projects.length + 1),
      name: '',
      client: '',
      branchId: selectedBranchId !== 'ALL' ? selectedBranchId : data.branches[0].id,
      location: '',
      manager: '',
      supervisor: '',
      status: 'نشط',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '2027-01-01',
      completionPercentage: 10,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.name) return;
    onSaveProject(editingProject);
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">إدارة المشاريع ومواقع العمل</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مشاريع البنية التحتية، درء أخطار السيول، السفلتة والإنارة، ونسب الإنجاز الميداني
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewProjectModal}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشروع جديد</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المشروع، رقم العقد، العميل، أو الموقع..."
          className="w-full sm:max-w-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">كافة الحالات</option>
            <option value="نشط">نشط</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="مكتمل">مكتمل</option>
            <option value="متوقف">متوقف</option>
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => {
          const branch = data.branches.find((b) => b.id === project.branchId);
          const teams = data.teams.filter((t) => t.projectId === project.id);
          const equipment = data.equipment.filter((e) => e.projectId === project.id);
          const workers = data.workers.filter((w) => w.projectId === project.id);

          return (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {project.projectNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {project.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{project.name}</h3>
                <div className="text-xs text-slate-400 mb-3 space-y-1">
                  <div>العميل / المالك: <span className="text-slate-200 font-semibold">{project.client}</span></div>
                  <div>الموقع الميداني: <span className="text-slate-300">{project.location}</span></div>
                  <div>الفرع المشرف: <span className="text-amber-300 font-medium">{branch?.name}</span></div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850 mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">نسبة الإنجاز المعتمدة:</span>
                    <span className="font-bold text-amber-400">{project.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${project.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Connected resources stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">الفرق المخصصة</span>
                    <span className="font-bold text-white text-sm">{teams.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">المعدات في الموقع</span>
                    <span className="font-bold text-emerald-400 text-sm">{equipment.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">العمالة المباشرة</span>
                    <span className="font-bold text-sky-400 text-sm">
                      {teams.reduce((acc, t) => acc + t.workersCount, 0) || workers.length}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>مدير المشروع:</span>
                    <span className="text-slate-200">{project.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ البداية:</span>
                    <span className="font-mono text-slate-300">{project.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الانتهاء المتوقع:</span>
                    <span className="font-mono text-amber-300">{project.expectedEndDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف المشروع ${project.name}؟`)) onDeleteProject(project.id);
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

      {/* Edit Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">بيانات المشروع وموقع العمل</h3>
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
                  <label className="block text-slate-400 mb-1">اسم المشروع *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم المشروع / العقد *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.projectNumber}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, projectNumber: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الجهة المالكة / العميل *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    placeholder="وزارة النقل، أمانة المنطقة، إلخ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الفرع المسؤول *</label>
                  <select
                    value={editingProject.branchId}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, branchId: e.target.value })
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">مدير المشروع</label>
                  <input
                    type="text"
                    value={editingProject.manager}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, manager: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">موقع المشروع</label>
                  <input
                    type="text"
                    value={editingProject.location}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, location: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={editingProject.startDate}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, startDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الانتهاء المتوقع</label>
                  <input
                    type="date"
                    value={editingProject.expectedEndDate}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, expectedEndDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">نسبة الإنجاز (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProject.completionPercentage}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        completionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={editingProject.notes || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, notes: e.target.value })}
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
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
