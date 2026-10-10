/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SystemData,
  UserProfile,
  Branch,
  Project,
  Team,
  Worker,
  WorkerLeave,
  LaborCase,
  Equipment,
  MaintenanceReport,
  SparePart,
  PreventiveMaintenancePlan,
  AppNotification,
} from './types';
import {
  getStoredData,
  saveDataToStorage,
  fetchRemoteOrLocalData,
  getCurrentUser,
  setCurrentUser,
  isUserAuthenticated,
  loginUser,
  logoutUser,
  logAction,
  addNotification,
  SYSTEM_USERS,
} from './utils/storage';
import { INITIAL_SYSTEM_DATA } from './data/seedData';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { QuickActionsModal } from './components/QuickActionsModal';
import { SaudiMap } from './components/SaudiMap';
import { GeminiChatbot } from './components/GeminiChatbot';
import { signInWithGoogle, subscribeToFirestoreSystemData } from './firebase/config';
import { Sparkles } from 'lucide-react';

// Views
import { LoginView } from './views/LoginView';
import { UserManagementView } from './views/UserManagementView';
import { DashboardView } from './views/DashboardView';
import { CentralAdminOverview } from './views/CentralAdminOverview';
import { BranchesView } from './views/BranchesView';
import { ProjectsView } from './views/ProjectsView';
import { TeamsView } from './views/TeamsView';
import { WorkersView } from './views/WorkersView';
import { LeavesView } from './views/LeavesView';
import { LaborCasesView } from './views/LaborCasesView';
import { EquipmentView } from './views/EquipmentView';
import { EquipmentHistoryView } from './views/EquipmentHistoryView';
import { MaintenanceView } from './views/MaintenanceView';
import { SparePartsView } from './views/SparePartsView';
import { PreventiveMaintenanceView } from './views/PreventiveMaintenanceView';
import { MaintenanceCostsView } from './views/MaintenanceCostsView';
import { TransferManagementView } from './views/TransferManagementView';
import { ReportsView } from './views/ReportsView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsBackupView } from './views/SettingsBackupView';

export default function App() {
  const [systemData, setSystemData] = useState<SystemData>(() => getStoredData());
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(() => getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAuthenticated());
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [historyEquipmentId, setHistoryEquipmentId] = useState<string | undefined>(undefined);

  // Sync data initially from server if available
  useEffect(() => {
    fetchRemoteOrLocalData().then((data) => {
      setSystemData(data);
    });

    const handleStorageUpdate = () => {
      setSystemData(getStoredData());
    };

    const handleUserUpdate = () => {
      setCurrentUserProfile(getCurrentUser());
    };

    const handleUserLogout = () => {
      setIsAuthenticated(false);
    };

    const unsubscribeFirestore = subscribeToFirestoreSystemData((remoteData) => {
      setSystemData(remoteData);
    });

    window.addEventListener('ofooq-data-updated', handleStorageUpdate);
    window.addEventListener('ofooq-user-changed', handleUserUpdate);
    window.addEventListener('ofooq-user-logged-out', handleUserLogout);

    return () => {
      unsubscribeFirestore();
      window.removeEventListener('ofooq-data-updated', handleStorageUpdate);
      window.removeEventListener('ofooq-user-changed', handleUserUpdate);
      window.removeEventListener('ofooq-user-logged-out', handleUserLogout);
    };
  }, []);

  // Update helper that saves and logs
  const updateSystemState = (
    updater: (prev: SystemData) => SystemData,
    logInfo?: {
      actionType: any;
      entityType: any;
      description: string;
      entityId?: string;
    }
  ) => {
    setSystemData((prev) => {
      let next = updater(prev);
      if (logInfo) {
        next = logAction(
          next,
          currentUserProfile,
          logInfo.actionType,
          logInfo.entityType,
          logInfo.description,
          logInfo.entityId
        );
      } else {
        saveDataToStorage(next);
      }
      return next;
    });
  };

  // Branch CRUD
  const handleSaveBranch = (branch: Branch) => {
    updateSystemState(
      (prev) => {
        const exists = prev.branches.some((b) => b.id === branch.id);
        const branches = exists
          ? prev.branches.map((b) => (b.id === branch.id ? branch : b))
          : [...prev.branches, branch];
        return { ...prev, branches };
      },
      {
        actionType: 'تعديل',
        entityType: 'فرع',
        description: `تحديث/إضافة بيانات الفرع: ${branch.name}`,
        entityId: branch.code,
      }
    );
  };

  const handleDeleteBranch = (branchId: string) => {
    const branch = systemData.branches.find((b) => b.id === branchId);
    updateSystemState(
      (prev) => ({
        ...prev,
        branches: prev.branches.filter((b) => b.id !== branchId),
      }),
      {
        actionType: 'حذف',
        entityType: 'فرع',
        description: `حذف الفرع: ${branch?.name || branchId}`,
      }
    );
  };

  // Project CRUD
  const handleSaveProject = (project: Project) => {
    updateSystemState(
      (prev) => {
        const exists = prev.projects.some((p) => p.id === project.id);
        const projects = exists
          ? prev.projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...prev.projects];
        return { ...prev, projects };
      },
      {
        actionType: 'تعديل',
        entityType: 'مشروع',
        description: `حفظ بيانات المشروع: ${project.name}`,
        entityId: project.projectNumber,
      }
    );
  };

  const handleDeleteProject = (projectId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
    }));
  };

  // Team CRUD
  const handleSaveTeam = (team: Team) => {
    updateSystemState(
      (prev) => {
        const exists = prev.teams.some((t) => t.id === team.id);
        const teams = exists
          ? prev.teams.map((t) => (t.id === team.id ? team : t))
          : [team, ...prev.teams];
        return { ...prev, teams };
      },
      {
        actionType: 'تعديل',
        entityType: 'فريق',
        description: `حفظ بيانات الفريق: ${team.name} (${team.teamNumber})`,
        entityId: team.teamNumber,
      }
    );
  };

  const handleDeleteTeam = (teamId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== teamId),
    }));
  };

  // Worker CRUD & Transfers
  const handleSaveWorker = (worker: Worker) => {
    updateSystemState(
      (prev) => {
        const exists = prev.workers.some((w) => w.id === worker.id);
        const workers = exists
          ? prev.workers.map((w) => (w.id === worker.id ? worker : w))
          : [worker, ...prev.workers];
        return { ...prev, workers };
      },
      {
        actionType: 'تعديل',
        entityType: 'عامل',
        description: `حفظ ملف العامل: ${worker.fullName} (${worker.employeeNumber})`,
        entityId: worker.employeeNumber,
      }
    );
  };

  const handleDeleteWorker = (workerId: string) => {
    const w = systemData.workers.find((x) => x.id === workerId);
    updateSystemState(
      (prev) => ({
        ...prev,
        workers: prev.workers.filter((x) => x.id !== workerId),
      }),
      {
        actionType: 'حذف',
        entityType: 'عامل',
        description: `حذف العامل: ${w?.fullName || workerId}`,
      }
    );
  };

  const handleTransferWorker = (
    workerId: string,
    toBranchId: string,
    toTeamId: string,
    reason: string
  ) => {
    const worker = systemData.workers.find((w) => w.id === workerId);
    const fromBranch = systemData.branches.find((b) => b.id === worker?.branchId);
    const toBranch = systemData.branches.find((b) => b.id === toBranchId);
    const fromTeam = systemData.teams.find((t) => t.id === worker?.teamId);
    const toTeam = systemData.teams.find((t) => t.id === toTeamId);

    if (!worker || !toBranch) return;

    const newTransferRecord = {
      id: 'tr-w-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      fromBranch: fromBranch?.name || 'غير محدد',
      toBranch: toBranch.name,
      fromTeam: fromTeam?.name || 'بدون فريق',
      toTeam: toTeam?.name || 'بدون فريق',
      reason,
      approvedBy: currentUserProfile.name,
    };

    const updatedWorker: Worker = {
      ...worker,
      branchId: toBranchId,
      teamId: toTeamId,
      transferHistory: [newTransferRecord, ...worker.transferHistory],
    };

    handleSaveWorker(updatedWorker);
  };

  // Leaves CRUD
  const handleSaveLeave = (leave: WorkerLeave) => {
    updateSystemState(
      (prev) => {
        // Also update worker status to 'إجازة'
        const updatedWorkers = prev.workers.map((w) =>
          w.id === leave.workerId ? { ...w, status: 'إجازة' as const } : w
        );
        const leaves = [leave, ...prev.leaves];
        return { ...prev, workers: updatedWorkers, leaves };
      },
      {
        actionType: 'تسجيل إجازة',
        entityType: 'إجازة',
        description: `تسجيل إجازة للعامل: ${leave.workerName} لمدة ${leave.daysCount} يوماً`,
        entityId: leave.employeeNumber,
      }
    );
  };

  const handleDeleteLeave = (leaveId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      leaves: prev.leaves.filter((l) => l.id !== leaveId),
    }));
  };

  // Labor Cases CRUD
  const handleSaveCase = (laborCase: LaborCase) => {
    updateSystemState(
      (prev) => {
        const exists = prev.laborCases.some((c) => c.id === laborCase.id);
        const laborCases = exists
          ? prev.laborCases.map((c) => (c.id === laborCase.id ? laborCase : c))
          : [laborCase, ...prev.laborCases];
        return { ...prev, laborCases };
      },
      {
        actionType: 'تعديل',
        entityType: 'قضية',
        description: `تحديث/تسجيل قضية عمالية: ${laborCase.workerName} (${laborCase.caseNumber})`,
        entityId: laborCase.caseNumber,
      }
    );
  };

  const handleDeleteCase = (caseId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      laborCases: prev.laborCases.filter((c) => c.id !== caseId),
    }));
  };

  // Equipment CRUD & Transfers
  const handleSaveEquipment = (equipment: Equipment) => {
    updateSystemState(
      (prev) => {
        const exists = prev.equipment.some((e) => e.id === equipment.id);
        const equipmentList = exists
          ? prev.equipment.map((e) => (e.id === equipment.id ? equipment : e))
          : [equipment, ...prev.equipment];
        return { ...prev, equipment: equipmentList };
      },
      {
        actionType: 'تعديل',
        entityType: 'معدة',
        description: `تحديث/إضافة المعدة: ${equipment.name} (${equipment.equipmentNumber})`,
        entityId: equipment.equipmentNumber,
      }
    );
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    const e = systemData.equipment.find((x) => x.id === equipmentId);
    updateSystemState(
      (prev) => ({
        ...prev,
        equipment: prev.equipment.filter((x) => x.id !== equipmentId),
      }),
      {
        actionType: 'حذف',
        entityType: 'معدة',
        description: `حذف المعدة: ${e?.name || equipmentId}`,
      }
    );
  };

  const handleTransferEquipment = (
    equipmentId: string,
    toBranchId: string,
    reason: string,
    officer: string,
    condition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة'
  ) => {
    const equip = systemData.equipment.find((e) => e.id === equipmentId);
    const fromBranch = systemData.branches.find((b) => b.id === equip?.branchId);
    const toBranch = systemData.branches.find((b) => b.id === toBranchId);

    if (!equip || !toBranch) return;

    const transferDate = new Date().toISOString().split('T')[0];

    const transferRecord = {
      id: 'eq-tr-' + Date.now(),
      date: transferDate,
      equipmentId: equip.id,
      equipmentNumber: equip.equipmentNumber,
      equipmentName: equip.name,
      fromBranch: fromBranch?.name || 'غير محدد',
      toBranch: toBranch.name,
      reason,
      officer,
      equipmentCondition: condition,
    };

    // Also automatically write into equipment's timeline
    const timelineEvent = {
      id: 'tl-' + Date.now(),
      date: transferDate,
      title: `نقل المعدة إلى ${toBranch.name}`,
      description: `أمر نقل من ${fromBranch?.name || ''} إلى ${toBranch.name}. السبب: ${reason} (الحالة: ${condition})`,
      type: 'نقل' as const,
      performedBy: officer,
    };

    const updatedEquip: Equipment = {
      ...equip,
      branchId: toBranchId,
      timeline: [...equip.timeline, timelineEvent],
    };

    updateSystemState(
      (prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) => (e.id === equip.id ? updatedEquip : e)),
        equipmentTransfers: [transferRecord, ...prev.equipmentTransfers],
      }),
      {
        actionType: 'نقل',
        entityType: 'معدة',
        description: `نقل المعدة ${equip.name} (${equip.equipmentNumber}) من ${fromBranch?.name} إلى ${toBranch.name}`,
        entityId: equip.equipmentNumber,
      }
    );
  };

  // Maintenance Report CRUD
  const handleSaveReport = (report: MaintenanceReport) => {
    updateSystemState(
      (prev) => {
        const exists = prev.maintenanceReports.some((r) => r.id === report.id);
        const maintenanceReports = exists
          ? prev.maintenanceReports.map((r) => (r.id === report.id ? report : r))
          : [report, ...prev.maintenanceReports];

        // If ticket reached stage 9 or 10, mark equipment as 'تعمل'
        let updatedEquipment = prev.equipment;
        if (report.currentStageIndex >= 8) {
          updatedEquipment = prev.equipment.map((e) =>
            e.id === report.equipmentId ? { ...e, status: 'تعمل' as const } : e
          );
        } else if (report.currentStageIndex >= 0) {
          updatedEquipment = prev.equipment.map((e) =>
            e.id === report.equipmentId ? { ...e, status: 'في الصيانة' as const } : e
          );
        }

        return { ...prev, maintenanceReports, equipment: updatedEquipment };
      },
      {
        actionType: 'تحديث مرحلة صيانة',
        entityType: 'بلاغ صيانة',
        description: `تحديث بلاغ الصيانة ${report.reportNumber} للمعدة ${report.equipmentName} (${report.stagesHistory[report.currentStageIndex]?.stageName})`,
        entityId: report.reportNumber,
      }
    );
  };

  const handleDeleteReport = (reportId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      maintenanceReports: prev.maintenanceReports.filter((r) => r.id !== reportId),
    }));
  };

  // Spare Parts CRUD
  const handleSaveSparePart = (part: SparePart) => {
    updateSystemState(
      (prev) => {
        const exists = prev.spareParts.some((p) => p.id === part.id);
        const spareParts = exists
          ? prev.spareParts.map((p) => (p.id === part.id ? part : p))
          : [part, ...prev.spareParts];
        return { ...prev, spareParts };
      },
      {
        actionType: 'تعديل',
        entityType: 'قطعة غيار',
        description: `تحديث قطعة الغيار: ${part.name} (${part.partNumber})`,
        entityId: part.partNumber,
      }
    );
  };

  const handleDeleteSparePart = (partId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.filter((p) => p.id !== partId),
    }));
  };

  // Preventive Plan CRUD
  const handleSavePlan = (plan: PreventiveMaintenancePlan) => {
    updateSystemState(
      (prev) => {
        const exists = prev.preventivePlans.some((p) => p.id === plan.id);
        const preventivePlans = exists
          ? prev.preventivePlans.map((p) => (p.id === plan.id ? plan : p))
          : [plan, ...prev.preventivePlans];
        return { ...prev, preventivePlans };
      },
      {
        actionType: 'تعديل',
        entityType: 'معدة',
        description: `جدولة صيانة وقائية للمعدة ${plan.equipmentName}: ${plan.maintenanceType}`,
        entityId: plan.equipmentNumber,
      }
    );
  };

  const handleDeletePlan = (planId: string) => {
    updateSystemState((prev) => ({
      ...prev,
      preventivePlans: prev.preventivePlans.filter((p) => p.id !== planId),
    }));
  };

  // Notifications
  const handleMarkNotificationAsRead = (id: string) => {
    updateSystemState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const handleMarkAllNotificationsAsRead = () => {
    updateSystemState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // User switcher
  const handleChangeUser = (newUser: UserProfile) => {
    setCurrentUserProfile(newUser);
    setCurrentUser(newUser);
    if (newUser.branchId) {
      setSelectedBranchId(newUser.branchId);
    } else {
      setSelectedBranchId('ALL');
    }
  };

  // Auth handlers
  const handleLogin = (user: UserProfile) => {
    loginUser(user);
    setCurrentUserProfile(user);
    if (user.branchId) {
      setSelectedBranchId(user.branchId);
    } else {
      setSelectedBranchId('ALL');
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  const handleCreateAccount = (newUser: UserProfile) => {
    updateSystemState(
      (prev) => {
        const existingList = prev.users || SYSTEM_USERS;
        return {
          ...prev,
          users: [...existingList, newUser],
        };
      },
      {
        actionType: 'إضافة',
        entityType: 'عامل',
        description: `إنشاء وتفعيل حساب موظف جديد: ${newUser.name} بصلاحية ${newUser.role} ونطاق فرع ${newUser.branchName}`,
        entityId: newUser.username,
      }
    );
    loginUser(newUser);
    setCurrentUserProfile(newUser);
    if (newUser.branchId) {
      setSelectedBranchId(newUser.branchId);
    } else {
      setSelectedBranchId('ALL');
    }
    setIsAuthenticated(true);
  };

  // User management CRUD
  const handleSaveUser = (user: UserProfile) => {
    updateSystemState(
      (prev) => {
        const existingList = prev.users || SYSTEM_USERS;
        const exists = existingList.some((u) => u.id === user.id);
        const users = exists
          ? existingList.map((u) => (u.id === user.id ? user : u))
          : [...existingList, user];
        return { ...prev, users };
      },
      {
        actionType: 'تعديل',
        entityType: 'عامل',
        description: `تحديث/إضافة بيانات الحساب والصلاحيات: ${user.name} (${user.role})`,
        entityId: user.username,
      }
    );

    if (user.id === currentUserProfile.id) {
      setCurrentUserProfile(user);
      setCurrentUser(user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = (systemData.users || SYSTEM_USERS).find((u) => u.id === userId);
    updateSystemState(
      (prev) => {
        const users = (prev.users || SYSTEM_USERS).filter((u) => u.id !== userId);
        return { ...prev, users };
      },
      {
        actionType: 'حذف',
        entityType: 'عامل',
        description: `حذف حساب الموظف: ${userToDelete?.name || userId}`,
        entityId: userToDelete?.username,
      }
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      const { profile } = await signInWithGoogle();
      handleCreateAccount(profile);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      throw err;
    }
  };

  // Stats badge numbers
  const statsCounts = {
    maintenanceCount: systemData.maintenanceReports.filter((m) => m.status !== 'مكتمل').length,
    casesCount: systemData.laborCases.filter(
      (c) => c.status !== 'مغلقة' && c.status !== 'تم حلها'
    ).length,
    leavesExpiringCount: systemData.leaves.filter((l) => l.status === 'سارية').length,
  };

  // Gate app behind login view if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginView
        users={systemData.users && systemData.users.length > 0 ? systemData.users : SYSTEM_USERS}
        branches={systemData.branches}
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccount}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Application Header */}
      <Header
        branches={systemData.branches}
        selectedBranchId={selectedBranchId}
        onSelectBranch={(bId) => setSelectedBranchId(bId)}
        currentUser={currentUserProfile}
        onChangeUser={handleChangeUser}
        notifications={systemData.notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onOpenQuickActions={() => setQuickActionsOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        globalSearchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
        onNavigateToTab={(tId) => setActiveTab(tId as TabId)}
        onLogout={handleLogout}
        usersList={systemData.users || SYSTEM_USERS}
      />

      {/* Main Workspace with Fixed/Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUserProfile}
          onLogout={handleLogout}
          statsCounts={statsCounts}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardView
              data={systemData}
              selectedBranchId={selectedBranchId}
              onSelectBranch={setSelectedBranchId}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Gemini AI Multi-turn Chatbot Tab */}
          {activeTab === 'gemini-chat' && (
            <GeminiChatbot
              systemData={systemData}
              currentUser={currentUserProfile}
              selectedBranchId={selectedBranchId}
            />
          )}

          {/* Central Admin Overview Tab */}
          {activeTab === 'central-overview' && (
            <CentralAdminOverview
              data={systemData}
              onSelectBranchAndNavigate={(bId, tab) => {
                setSelectedBranchId(bId);
                if (tab) setActiveTab(tab);
              }}
            />
          )}

          {/* Operations Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <SaudiMap
                branches={systemData.branches}
                systemData={systemData}
                selectedBranchId={selectedBranchId}
                onSelectBranch={(bId) => {
                  setSelectedBranchId(bId);
                  setActiveTab('dashboard');
                }}
              />
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <BranchesView
              data={systemData}
              currentUser={currentUserProfile}
              onSaveBranch={handleSaveBranch}
              onDeleteBranch={handleDeleteBranch}
              onSelectBranchFilter={(bId) => {
                setSelectedBranchId(bId);
                setActiveTab('dashboard');
              }}
            />
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <ProjectsView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <TeamsView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveTeam={handleSaveTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          )}

          {/* Workers Database Tab */}
          {activeTab === 'workers' && (
            <WorkersView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveWorker={handleSaveWorker}
              onDeleteWorker={handleDeleteWorker}
              onTransferWorker={handleTransferWorker}
            />
          )}

          {/* Leaves Tab */}
          {activeTab === 'leaves' && (
            <LeavesView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveLeave={handleSaveLeave}
              onDeleteLeave={handleDeleteLeave}
            />
          )}

          {/* Labor Cases Tab */}
          {activeTab === 'labor-cases' && (
            <LaborCasesView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveCase={handleSaveCase}
              onDeleteCase={handleDeleteCase}
            />
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <EquipmentView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveEquipment={handleSaveEquipment}
              onDeleteEquipment={handleDeleteEquipment}
              onTransferEquipment={handleTransferEquipment}
              onViewEquipmentHistory={(eqId) => {
                setHistoryEquipmentId(eqId);
                setActiveTab('equipment-history');
              }}
            />
          )}

          {/* Equipment History Timeline Tab */}
          {activeTab === 'equipment-history' && (
            <EquipmentHistoryView
              data={systemData}
              selectedEquipmentId={historyEquipmentId}
              currentUser={currentUserProfile}
              onSaveEquipment={handleSaveEquipment}
            />
          )}

          {/* 10-Stage Maintenance Reports Tab */}
          {activeTab === 'maintenance' && (
            <MaintenanceView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSaveReport={handleSaveReport}
              onDeleteReport={handleDeleteReport}
            />
          )}

          {/* Spare Parts Tab */}
          {activeTab === 'spare-parts' && (
            <SparePartsView
              data={systemData}
              currentUser={currentUserProfile}
              onSaveSparePart={handleSaveSparePart}
              onDeleteSparePart={handleDeleteSparePart}
            />
          )}

          {/* Preventive Maintenance Tab */}
          {activeTab === 'preventive' && (
            <PreventiveMaintenanceView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
              onSavePlan={handleSavePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {/* Costs & Accounting Tab */}
          {activeTab === 'costs' && (
            <MaintenanceCostsView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
            />
          )}

          {/* Transfers Management Tab */}
          {activeTab === 'transfers' && (
            <TransferManagementView
              data={systemData}
              currentUser={currentUserProfile}
              onTransferEquipment={handleTransferEquipment}
              onTransferWorker={handleTransferWorker}
            />
          )}

          {/* Reports & Export Tab */}
          {activeTab === 'reports' && (
            <ReportsView
              data={systemData}
              selectedBranchId={selectedBranchId}
              currentUser={currentUserProfile}
            />
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit-log' && (
            <AuditLogView
              data={systemData}
              selectedBranchId={selectedBranchId}
            />
          )}

          {/* Users & Permissions Management Tab */}
          {activeTab === 'users' && (
            <UserManagementView
              data={systemData}
              currentUser={currentUserProfile}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={(u) => handleChangeUser(u)}
            />
          )}

          {/* Settings, RBAC & Backup Tab */}
          {activeTab === 'settings' && (
            <SettingsBackupView
              data={systemData}
              currentUser={currentUserProfile}
              onChangeUser={handleChangeUser}
              onRestoreData={(imported) => {
                setSystemData(imported);
                saveDataToStorage(imported);
              }}
              onResetData={() => {
                setSystemData(INITIAL_SYSTEM_DATA);
                saveDataToStorage(INITIAL_SYSTEM_DATA);
              }}
            />
          )}
        </main>
      </div>

      {/* Quick Operations Modal */}
      <QuickActionsModal
        isOpen={quickActionsOpen}
        onClose={() => setQuickActionsOpen(false)}
        onTriggerAction={(actionId) => {
          // Can pre-trigger modal open in target tab
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Floating Gemini AI Quick Launcher */}
      {activeTab !== 'gemini-chat' && (
        <button
          onClick={() => setActiveTab('gemini-chat')}
          className="fixed bottom-5 left-5 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-105 group border border-amber-300/40"
          title="فتح مستشار أفق الذكي ✦ Gemini AI"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>مستشار أفق الذكي ✦ AI</span>
        </button>
      )}
    </div>
  );
}
