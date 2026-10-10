import React, { useState } from 'react';
import { UserProfile, UserRole, UserPermissions, SystemData } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Edit2,
  Trash2,
  Lock,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Search,
  KeyRound,
  ShieldAlert,
  HardHat,
  Truck,
  Wrench,
  FileSpreadsheet,
  LogIn,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from 'lucide-react';
import { getDefaultPermissionsForRole } from '../utils/storage';

interface UserManagementViewProps {
  data: SystemData;
  currentUser: UserProfile;
  onSaveUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  data,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const canManage =
    currentUser.role === 'المدير العام' ||
    currentUser.role === 'الإدارة المركزية' ||
    currentUser.permissions?.manageUsers;

  const userList = data.users || [];

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesBranch =
      branchFilter === 'ALL' ||
      (branchFilter === 'CENTRAL' && (!u.branchId || u.branchId === 'ALL')) ||
      u.branchId === branchFilter;
    return matchesSearch && matchesRole && matchesBranch;
  });

  const openNewUserModal = () => {
    const defaultRole: UserRole = 'مسؤول الفرع';
    setEditingUser({
      id: 'usr-' + Date.now(),
      name: '',
      username: '',
      password: '123',
      role: defaultRole,
      branchId: data.branches[0]?.id || 'branch-makkah',
      branchName: data.branches[0]?.name || 'فرع مكة المكرمة',
      email: '',
      phone: '05',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: getDefaultPermissionsForRole(defaultRole),
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser({
      ...user,
      permissions: user.permissions || getDefaultPermissionsForRole(user.role),
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role,
      permissions: getDefaultPermissionsForRole(role),
    });
  };

  const togglePermission = (key: keyof UserPermissions) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || getDefaultPermissionsForRole(editingUser.role);
    setEditingUser({
      ...editingUser,
      permissions: {
        ...currentPerms,
        [key]: !currentPerms[key],
      },
    });
  };

  const setAllPermissions = (value: boolean) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: {
        manageBranches: value,
        manageProjects: value,
        manageTeams: value,
        manageWorkers: value,
        manageLeaves: value,
        manageLaborCases: value,
        manageEquipment: value,
        manageMaintenance: value,
        manageSpareParts: value,
        managePreventive: value,
        manageTransfers: value,
        viewFinancials: value,
        exportReports: value,
        manageUsers: value,
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    if (!editingUser.name.trim()) {
      setFormError('الاسم الكامل مطلوب.');
      return;
    }
    if (!editingUser.username?.trim()) {
      setFormError('اسم المستخدم للدخول مطلوب.');
      return;
    }

    // Check duplicate username if adding new
    const duplicate = userList.some(
      (u) =>
        u.id !== editingUser.id &&
        u.username?.toLowerCase() === editingUser.username?.trim().toLowerCase()
    );
    if (duplicate) {
      setFormError(`اسم المستخدم "${editingUser.username}" مسجل مسبقاً لموظف آخر.`);
      return;
    }

    const branch = data.branches.find((b) => b.id === editingUser.branchId);
    const updated: UserProfile = {
      ...editingUser,
      name: editingUser.name.trim(),
      username: editingUser.username.trim().toLowerCase(),
      branchName:
        !editingUser.branchId || editingUser.branchId === 'ALL'
          ? 'الإدارة العامة - كافة الفروع'
          : branch
          ? branch.name
          : 'الفرع المعتمد',
      email:
        editingUser.email.trim() ||
        `${editingUser.username.trim().toLowerCase()}@ofooq-infra.sa`,
      phone: editingUser.phone.trim(),
      permissions: editingUser.permissions || getDefaultPermissionsForRole(editingUser.role),
    };

    onSaveUser(updated);
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Stats calculation
  const totalUsers = userList.length;
  const activeCount = userList.filter((u) => u.isActive !== false).length;
  const branchManagersCount = userList.filter(
    (u) => u.role === 'مدير الفرع' || u.role === 'مسؤول الفرع'
  ).length;
  const centralAdminsCount = userList.filter(
    (u) => u.role === 'المدير العام' || u.role === 'الإدارة المركزية'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white">إدارة حسابات المستخدمين وصلاحيات العمل (RBAC)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء حساب لكل شخص في شركة أفق وتحديد صلاحيات العمل ونطاق الفروع بدقة تامة
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewUserModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/15 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب موظف جديد وتحديد الصلاحية</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-medium">إجمالي حسابات المنظومة</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{totalUsers}</div>
          <div className="text-[10px] text-amber-400 mt-1">كافة الفروع والإدارات</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-medium">الحسابات النشطة والمفعلة</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{activeCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">مصرح لها بتسجيل الدخول</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-medium">مدراء ومسؤولو الفروع</div>
          <div className="text-2xl font-black text-sky-400 mt-1 font-mono">{branchManagersCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">مكة، الرياض، أبها، العلايا، النماص</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-medium">الإدارة المركزية والعامة</div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{centralAdminsCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">إشراف شامل على كافة الفروع</div>
        </div>
      </div>

      {/* Role Explanations Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl">
          <span className="font-bold text-amber-400 block mb-1">المدير العام والإدارة المركزية</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            صلاحيات كاملة شاملة لجميع الفروع الخمسة والتقارير والاعتمادات والتحكم بالبيانات.
          </p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl">
          <span className="font-bold text-sky-400 block mb-1">مدير ومسؤول الفرع</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            مقيد بفرعه فقط لإدارة العمالة والمعدات والفرق ورفع بلاغات الصيانة لفرعه.
          </p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-rose-500/30 rounded-xl">
          <span className="font-bold text-rose-400 block mb-1">مسؤول الصيانة المركزية</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            إدارة أسطول الآليات والمعدات، ومراحل الصيانة العشرة وقطع الغيار والتكاليف.
          </p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl">
          <span className="font-bold text-emerald-400 block mb-1">مشرف الفريق والمشاهدة</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            متابعة الفريق الميداني والأعطال، أو حساب استعراض للقراءة فقط دون إمكانية التعديل.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، البريد، أو الصلاحية..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">كافة الفروع</option>
            <option value="CENTRAL">المركز الرئيسي فقط</option>
            {data.branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 {b.name}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">كافة الأدوار والصلاحيات</option>
            <option value="المدير العام">المدير العام</option>
            <option value="الإدارة المركزية">الإدارة المركزية</option>
            <option value="مدير الفرع">مدير الفرع</option>
            <option value="مسؤول الفرع">مسؤول الفرع</option>
            <option value="مشرف الفريق">مشرف الفريق</option>
            <option value="مسؤول الصيانة">مسؤول الصيانة</option>
            <option value="مستخدم مشاهدة">مستخدم مشاهدة</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3.5 px-4 font-bold text-slate-300">اسم الموظف / الحساب</th>
                <th className="py-3.5 px-3 font-semibold">اسم المستخدم للدخول</th>
                <th className="py-3.5 px-3 font-semibold">الدور والصلاحية</th>
                <th className="py-3.5 px-3 font-semibold">نطاق الفرع المصرح</th>
                <th className="py-3.5 px-3 font-semibold">بيانات التواصل</th>
                <th className="py-3.5 px-3 font-semibold text-center">حالة الحساب</th>
                <th className="py-3.5 px-4 font-semibold text-center">إجراءات الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => {
                const isSuperAdmin = u.role === 'المدير العام';
                const isCurrentUser = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                أنت حالياً
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            تاريخ التسجيل: {u.createdAt || '2024-01-01'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {u.username || 'user'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'المدير العام'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : u.role === 'الإدارة المركزية'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'مدير الفرع' || u.role === 'مسؤول الفرع'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : u.role === 'مسؤول الصيانة'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-200 font-medium">
                      {u.branchName || 'كافة الفروع (المركز الرئيسي)'}
                    </td>

                    <td className="py-3.5 px-3 text-[11px] text-slate-400">
                      <div>{u.email}</div>
                      <div className="font-mono text-slate-500" dir="ltr">
                        {u.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.isActive !== false ? 'نشط ومفعل' : 'معطل'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Switch user / Test Login */}
                        {onSwitchUser && (
                          <button
                            onClick={() => onSwitchUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300"
                            title="دخول بهذا الحساب لاختبار الصلاحية"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="تعديل الحساب وتحديد الصلاحية"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        {!isSuperAdmin && canManage && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حساب ${u.name}؟`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {editingUser.name ? `تعديل صلاحيات وحساب: ${editingUser.name}` : 'إنشاء حساب موظف جديد وتحديد الصلاحية'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="m-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-right">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الاسم الكامل للموظف *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="مثال: م. سلطان القرني"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم المستخدم للدخول (Username) *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().trim() })}
                    placeholder="مثال: sultan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={editingUser.password || '123'}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-9 py-2 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الجوال</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="05XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="sultan@ofooq-infra.sa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">حالة الحساب</label>
                  <select
                    value={editingUser.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isActive: e.target.value === 'active',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">🟢 نشط ومفعل (يمكنه تسجيل الدخول)</option>
                    <option value="inactive">🔴 معطل مؤقتاً (ممنوع من الدخول)</option>
                  </select>
                </div>
              </div>

              {/* Role & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">الدور والصلاحية (Role) *</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="المدير العام">المدير العام (صلاحيات كاملة لجميع الفروع)</option>
                    <option value="الإدارة المركزية">الإدارة المركزية (متابعة شاملة وتقارير)</option>
                    <option value="مدير الفرع">مدير الفرع (إدارة فرعه فقط)</option>
                    <option value="مسؤول الفرع">مسؤول الفرع (تحديث العمال والمعدات والفرق)</option>
                    <option value="مشرف الفريق">مشرف الفريق (فريقه والبلاغات)</option>
                    <option value="مسؤول الصيانة">مسؤول الصيانة (الأسطول وبلاغات الإصلاح)</option>
                    <option value="مستخدم مشاهدة">مستخدم مشاهدة (اطلاع فقط بدون تعديل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1">الفرع المصرح بالعمل فيه *</label>
                  <select
                    value={editingUser.branchId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingUser({
                        ...editingUser,
                        branchId: val ? val : undefined,
                      });
                    }}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">🌐 كافة الفروع (المركز الرئيسي / الإدارة العامة)</option>
                    {data.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>تحديد الصلاحيات الميدانية والتشغيلية للحساب</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAllPermissions(true)}
                      className="text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      تحديد الكل
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setAllPermissions(false)}
                      className="text-slate-400 hover:text-slate-300 underline font-medium"
                    >
                      إلغاء الكل
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          permissions: getDefaultPermissionsForRole(editingUser.role),
                        })
                      }
                      className="text-sky-400 hover:text-sky-300 underline font-medium"
                    >
                      استعادة افتراضي الدور
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageBranches}
                      onChange={() => togglePermission('manageBranches')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>إضافة وتعديل بيانات الفروع</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageProjects}
                      onChange={() => togglePermission('manageProjects')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <HardHat className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>إدارة المشاريع ومواقع العمل</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageTeams}
                      onChange={() => togglePermission('manageTeams')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>إدارة الفرق الميدانية وتشكيلها</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageWorkers}
                      onChange={() => togglePermission('manageWorkers')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>إدارة ملفات العمالة والوثائق والكفالات</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageLeaves}
                      onChange={() => togglePermission('manageLeaves')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>إدارة إجازات العمال والتنبيهات</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageLaborCases}
                      onChange={() => togglePermission('manageLaborCases')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>إدارة القضايا والمشاكل العمالية</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageEquipment}
                      onChange={() => togglePermission('manageEquipment')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>إدارة أسطول المعدات والآليات</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageMaintenance}
                      onChange={() => togglePermission('manageMaintenance')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Wrench className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>بلاغات الأعطال ومراحل الإصلاح العشرة</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageSpareParts}
                      onChange={() => togglePermission('manageSpareParts')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>إدارة قطع الغيار ومستودع الصيانة</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageTransfers}
                      onChange={() => togglePermission('manageTransfers')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <Truck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>نقل المعدات والعمال بين الفروع</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.exportReports}
                      onChange={() => togglePermission('exportReports')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>تصدير وطباعة التقارير التشغيلية</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingUser.permissions?.manageUsers}
                      onChange={() => togglePermission('manageUsers')}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>إدارة حسابات الموظفين والصلاحيات</span>
                  </label>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold"
                >
                  حفظ وتأكيد بيانات الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
