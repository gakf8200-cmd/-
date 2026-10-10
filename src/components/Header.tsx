import React, { useState } from 'react';
import {
  Branch,
  UserProfile,
  AppNotification,
} from '../types';
import {
  Building2,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Menu,
  CheckCheck,
  LogOut,
  UserCog,
} from 'lucide-react';
import { SYSTEM_USERS } from '../utils/storage';

interface HeaderProps {
  branches: Branch[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenQuickActions: () => void;
  onToggleSidebar: () => void;
  globalSearchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateToTab?: (tabId: string) => void;
  onLogout?: () => void;
  usersList?: UserProfile[];
}

export const Header: React.FC<HeaderProps> = ({
  branches,
  selectedBranchId,
  onSelectBranch,
  currentUser,
  onChangeUser,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenQuickActions,
  onToggleSidebar,
  globalSearchQuery,
  onSearchChange,
  onNavigateToTab,
  onLogout,
  usersList,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left / Start: Brand Logo & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <span className="text-xl tracking-tighter">أُفق</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  شركة أُفق البنية التحتية
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  للمقاولات العامة
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                المنظومة المركزية لإدارة الفروع، المشاريع، الأسطول والتشغيل
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="بحث سريع: عامل، رقم معدة، فرع، بلاغ، قضية..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right / End: Branch Selector, Quick Action, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Branch Filter Selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedBranchId}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  🌐 المركز الرئيسي (كافة الفروع)
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    📍 {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onOpenQuickActions}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all shrink-0"
            title="إجراءات تشغيلية سريعة"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">إجراء سريع</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="التنبيهات والإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">مركز التنبيهات التشغيلية</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {notifications.length}
                    </span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>تحديد الكل كمقروء</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      لا توجد تنبيهات جديدة في الوقت الحالي
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationAsRead(notif.id);
                          if (notif.targetTab && onNavigateToTab) {
                            onNavigateToTab(notif.targetTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 transition-colors cursor-pointer text-xs ${
                          !notif.read ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-200">{notif.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded font-medium ${
                              notif.priority === 'عالي'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : notif.priority === 'متوسط'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{notif.date}</span>
                          {!notif.read && (
                            <span className="text-amber-400 font-medium">غير مقروء</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-right transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User & Role Switcher Dropdown */}
            {showUserDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[11px] text-slate-400">تبديل المستخدم لاختبار الصلاحيات (RBAC)</p>
                  <p className="text-xs font-bold text-white mt-0.5">{currentUser.name}</p>
                  <p className="text-[10px] text-amber-400 font-medium">{currentUser.branchName}</p>
                </div>

                <div className="space-y-1">
                  {(usersList || SYSTEM_USERS).map((usr) => {
                    const isSelected = usr.id === currentUser.id;
                    return (
                      <button
                        key={usr.id}
                        onClick={() => {
                          onChangeUser(usr);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="text-white font-medium">{usr.name}</div>
                          <div className="text-[10px] text-slate-400">{usr.role}</div>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Management and Logout Actions */}
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        onNavigateToTab('users');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-slate-900 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>إدارة حسابات الموظفين والصلاحيات</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج من المنظومة</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
