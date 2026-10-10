import React, { useState } from 'react';
import { UserProfile, UserRole, UserPermissions, Branch } from '../types';
import {
  ShieldCheck,
  Lock,
  User,
  UserPlus,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  KeyRound,
  CheckSquare,
  Square,
  Wrench,
  Users,
  Truck,
  HardHat,
  FileSpreadsheet,
} from 'lucide-react';
import { getDefaultPermissionsForRole } from '../utils/storage';

interface LoginViewProps {
  users: UserProfile[];
  branches: Branch[];
  onLogin: (user: UserProfile) => void;
  onCreateAccount: (newUser: UserProfile) => void;
  onGoogleSignIn?: () => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  branches,
  onLogin,
  onCreateAccount,
  onGoogleSignIn,
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'quick'>('login');

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register / Create Account form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('05');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('مسؤول الفرع');
  const [regBranchId, setRegBranchId] = useState<string>('branch-makkah');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Granular permissions for the account being created
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>(() =>
    getDefaultPermissionsForRole('مسؤول الفرع')
  );

  // Update permissions when role changes
  const handleRoleChange = (role: UserRole) => {
    setRegRole(role);
    setCustomPermissions(getDefaultPermissionsForRole(role));
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setAllPermissions = (value: boolean) => {
    setCustomPermissions({
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
    });
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = usernameInput.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username?.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser) &&
        u.isActive !== false
    );

    if (!found) {
      setLoginError('اسم المستخدم أو البريد الإلكتروني غير مسجل، أو الحساب معطل.');
      return;
    }

    if (found.password && found.password !== passwordInput) {
      setLoginError('كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مجدداً.');
      return;
    }

    onLogin(found);
  };

  // Handle Create Account submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('يرجى إدخال الاسم الكامل للموظف.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('يرجى تحديد اسم المستخدم للدخول.');
      return;
    }
    if (!regPassword) {
      setRegError('يرجى تحديد كلمة المرور.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    // Check if username already exists
    const exists = users.some(
      (u) => u.username?.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (exists) {
      setRegError(`اسم المستخدم "${regUsername}" مسجل مسبقاً لموظف آخر. يرجى اختيار اسم آخر.`);
      return;
    }

    const branch = branches.find((b) => b.id === regBranchId);
    const branchName =
      regBranchId === 'ALL' || !regBranchId
        ? 'الإدارة العامة - كافة الفروع'
        : branch
        ? branch.name
        : 'الفرع المعتمد';

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      email: regEmail.trim() || `${regUsername.trim()}@ofooq-infra.sa`,
      phone: regPhone.trim(),
      role: regRole,
      branchId: regBranchId === 'ALL' ? undefined : regBranchId,
      branchName,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: customPermissions,
    };

    onCreateAccount(newUser);
    setRegSuccess(`تم إنشاء حساب ${newUser.name} بنجاح بصلاحية (${newUser.role})! جارٍ الدخول...`);
    setTimeout(() => {
      onLogin(newUser);
    }, 900);
  };

  // Quick login handler
  const handleQuickLogin = (user: UserProfile) => {
    setUsernameInput(user.username || user.email);
    setPasswordInput(user.password || '123');
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-['Cairo',sans-serif]">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-black shadow-xl shadow-amber-500/20 mb-3">
            <span className="text-3xl tracking-tighter">أُفق</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            شركة أُفق البنية التحتية للمقاولات
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            المنظومة المركزية الموحدة لإدارة الفروع، المشاريع، الأسطول، والعمالة
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-[11px] text-amber-400 font-semibold">
            <span>📍 فرع مكة المكرمة</span>
            <span>·</span>
            <span>📍 فرع الرياض</span>
            <span>·</span>
            <span>📍 فرع أبها</span>
            <span>·</span>
            <span>📍 فرع العلايا</span>
            <span>·</span>
            <span>📍 فرع النماص</span>
          </div>
        </div>

        {/* Tabs Bar: Login / Create Account / Quick Access */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1 mb-4 flex gap-1 shadow-lg backdrop-blur">
          <button
            onClick={() => setActiveMode('login')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeMode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            onClick={() => setActiveMode('register')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeMode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب وتحديد الصلاحية</span>
          </button>

          <button
            onClick={() => setActiveMode('quick')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeMode === 'quick'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>دخول سريع بالأدوار</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          {/* ================= MODE 1: LOGIN ================= */}
          {activeMode === 'login' && (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-800 text-right">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>تسجيل الدخول إلى حساب العمل</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  أدخل بيانات اعتمادك المسجلة أو اختر حساباً من الدخول السريع لاختبار الصلاحيات
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-right">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    اسم المستخدم أو البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="مثال: gm أو admin أو makkah أو riyadh"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-3 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="أدخل كلمة المرور (الافتراضية: 123)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <span>تذكر بيانات دخولي على هذا الجهاز</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveMode('register')}
                    className="text-amber-400 hover:text-amber-300 font-semibold text-xs"
                  >
                    ليس لديك حساب؟ أنشئ حساباً جديداً
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>دخول إلى لوحة إدارة العمليات</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>

                {onGoogleSignIn && (
                  <>
                    <div className="flex items-center gap-2 my-2 text-[11px] text-slate-500">
                      <div className="flex-1 h-px bg-slate-800"></div>
                      <span>أو المصادقة السحابية</span>
                      <div className="flex-1 h-px bg-slate-800"></div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsGoogleLoading(true);
                          await onGoogleSignIn();
                        } catch (err: any) {
                          setLoginError(err?.message || 'فشل تسجيل الدخول بواسطة Google');
                        } finally {
                          setIsGoogleLoading(false);
                        }
                      }}
                      disabled={isGoogleLoading}
                      className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-750 hover:border-amber-500/50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {isGoogleLoading
                          ? 'جارٍ المصادقة مع Google و Firebase...'
                          : 'الدخول بحساب Google (Firebase Authentication)'}
                      </span>
                    </button>
                  </>
                )}
              </form>

              {/* Quick shortcut to switch role below form */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>تريد تجربة النظام مباشرة؟</span>
                <button
                  type="button"
                  onClick={() => setActiveMode('quick')}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>استعراض حسابات الأدوار الجاهزة (نقرة واحدة)</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: REGISTER / CREATE ACCOUNT ================= */}
          {activeMode === 'register' && (
            <div>
              <div className="mb-5 pb-4 border-b border-slate-800 text-right">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>إنشاء حساب موظف جديد وتحديد صلاحية العمل</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  قم بتسجيل بيانات الموظف وتحديد فرع العمل والدور الوظيفي وصلاحيات التشغيل بدقة
                </p>
              </div>

              {regError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs text-right">
                {/* Basic Info: Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      الاسم الكامل للموظف *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="مثال: م. خالد بن نايف العتيبي"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      اسم المستخدم للدخول (Username) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().trim())}
                        placeholder="مثال: khaled.otb"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Contact: Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="employee@ofooq-infra.sa"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      رقم الجوال
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="أنشئ كلمة مرور الحساب"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-9 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                        tabIndex={-1}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Role and Branch Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-amber-400 font-bold mb-1">
                      الدور والصلاحية الوظيفية (Role) *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="المدير العام">المدير العام (إشراف وصلاحيات شاملة)</option>
                      <option value="الإدارة المركزية">الإدارة المركزية (متابعة الفروع والتقارير)</option>
                      <option value="مدير الفرع">مدير الفرع (صلاحية كاملة لفرعه المحدد)</option>
                      <option value="مسؤول الفرع">مسؤول الفرع (تحديث العمال والمعدات لفرعه)</option>
                      <option value="مشرف الفريق">مشرف الفريق (فريقه الميداني والبلاغات)</option>
                      <option value="مسؤول الصيانة">مسؤول الصيانة (الأسطول وبلاغات الإصلاح)</option>
                      <option value="مستخدم مشاهدة">مستخدم مشاهدة (اطلاع وقراءة فقط دون تعديل)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-bold mb-1">
                      الفرع المصرح بالعمل فيه *
                    </label>
                    <select
                      value={regBranchId}
                      onChange={(e) => setRegBranchId(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">🌐 كافة الفروع (المركز الرئيسي / الإدارة العامة)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          📍 {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role Description Callout */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 leading-relaxed">
                  {regRole === 'المدير العام' && (
                    <span>يتمتع المدير العام بكامل الصلاحيات للإضافة والتعديل والحذف لكافة الفروع والمشاريع والحسابات.</span>
                  )}
                  {regRole === 'الإدارة المركزية' && (
                    <span>تستطيع الإدارة المركزية متابعة جميع الفروع، اعتماد التقارير، وإدارة العمليات المركزية.</span>
                  )}
                  {regRole === 'مدير الفرع' && (
                    <span>يكون مدير الفرع مسؤولاً عن كامل عمليات وأسطول وعمالة فرعه المحدد فقط.</span>
                  )}
                  {regRole === 'مسؤول الفرع' && (
                    <span>يستطيع مسؤول الفرع تحديث بيانات العمالة، الفرق، والمعدات، ورفع بلاغات الصيانة لفرعه.</span>
                  )}
                  {regRole === 'مشرف الفريق' && (
                    <span>يختص مشرف الفريق بمتابعة عمال ومعدات فريقه الميداني وتسجيل بلاغات الأعطال.</span>
                  )}
                  {regRole === 'مسؤول الصيانة' && (
                    <span>يتحكم مسؤول الصيانة بأسطول المعدات، قطع الغيار، ومراحل الإصلاح العشرة والتكاليف.</span>
                  )}
                  {regRole === 'مستخدم مشاهدة' && (
                    <span>يملك حق الاطلاع والاستعراض وتصدير التقارير فقط، ولا يحق له التعديل أو الحذف.</span>
                  )}
                </div>

                {/* Granular Permissions Section */}
                <div className="border border-slate-800 rounded-2xl p-3.5 bg-slate-950/70">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>تحديد مصفوفة الصلاحيات التفصيلية (Custom Permissions)</span>
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
                        onClick={() => setCustomPermissions(getDefaultPermissionsForRole(regRole))}
                        className="text-sky-400 hover:text-sky-300 underline font-medium"
                      >
                        إعادة تعيين للدور
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageBranches}
                        onChange={() => togglePermission('manageBranches')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>إضافة وتعديل بيانات الفروع</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageProjects}
                        onChange={() => togglePermission('manageProjects')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <HardHat className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>إدارة المشاريع ومواقع العمل</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageTeams}
                        onChange={() => togglePermission('manageTeams')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>إدارة الفرق الميدانية وتشكيلها</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageWorkers}
                        onChange={() => togglePermission('manageWorkers')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>إدارة ملفات العمالة والوثائق والكفالات</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageLeaves}
                        onChange={() => togglePermission('manageLeaves')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>إدارة ومتابعة إجازات العمال</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageLaborCases}
                        onChange={() => togglePermission('manageLaborCases')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>إدارة القضايا والمشاكل العمالية</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageEquipment}
                        onChange={() => togglePermission('manageEquipment')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>إدارة أسطول المعدات والآليات</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageMaintenance}
                        onChange={() => togglePermission('manageMaintenance')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Wrench className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>بلاغات الأعطال ومراحل الإصلاح الـ10</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageSpareParts}
                        onChange={() => togglePermission('manageSpareParts')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>إدارة قطع الغيار ومستودع الصيانة</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageTransfers}
                        onChange={() => togglePermission('manageTransfers')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <Truck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>نقل المعدات والعمال بين الفروع</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.exportReports}
                        onChange={() => togglePermission('exportReports')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>تصدير وطباعة التقارير التشغيلية</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customPermissions.manageUsers}
                        onChange={() => togglePermission('manageUsers')}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>إنشاء وإدارة حسابات الموظفين والصلاحيات</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>تأكيد إنشاء الحساب وبدء العمل فوراً</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= MODE 3: QUICK LOGIN ================= */}
          {activeMode === 'quick' && (
            <div>
              <div className="mb-5 pb-4 border-b border-slate-800 text-right">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>دخول تجريبي سريع بحسابات الفروع والأدوار المعتمدة</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  اختر أي دور لتجربة المنظومة والتحقق من تطبيق الصلاحيات ونطاق الفرع المخصص له
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {users.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => handleQuickLogin(usr)}
                    className="text-right p-3 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="overflow-hidden">
                      <div className="font-bold text-white text-xs group-hover:text-amber-300 truncate">
                        {usr.name}
                      </div>
                      <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                        {usr.role}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {usr.branchName || 'كافة الفروع الخمسة'}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono block mb-1">
                        {usr.username || 'user'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">كلمة المرور: 123</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <button
                  onClick={() => setActiveMode('register')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>تريد إضافة شخص جديد غير هؤلاء؟ اضغط هنا لإنشاء حسابه</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          شركة أفق البنية التحتية للمقاولات © 2026 · نظام المصادقة وإدارة صلاحيات الفروع الموحد
        </div>
      </div>
    </div>
  );
};
