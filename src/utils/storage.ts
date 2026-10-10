import {
  SystemData,
  UserProfile,
  UserRole,
  UserPermissions,
  AuditLogItem,
  AppNotification,
} from '../types';
import { INITIAL_SYSTEM_DATA } from '../data/seedData';

const STORAGE_KEY = 'ofooq_infrastructure_system_data_v1';
const USER_KEY = 'ofooq_infrastructure_current_user_v1';
const AUTH_SESSION_KEY = 'ofooq_infrastructure_auth_session_v1';

export function getDefaultPermissionsForRole(role: UserRole): UserPermissions {
  switch (role) {
    case 'المدير العام':
      return {
        manageBranches: true,
        manageProjects: true,
        manageTeams: true,
        manageWorkers: true,
        manageLeaves: true,
        manageLaborCases: true,
        manageEquipment: true,
        manageMaintenance: true,
        manageSpareParts: true,
        managePreventive: true,
        manageTransfers: true,
        viewFinancials: true,
        exportReports: true,
        manageUsers: true,
      };
    case 'الإدارة المركزية':
      return {
        manageBranches: true,
        manageProjects: true,
        manageTeams: true,
        manageWorkers: true,
        manageLeaves: true,
        manageLaborCases: true,
        manageEquipment: true,
        manageMaintenance: true,
        manageSpareParts: true,
        managePreventive: true,
        manageTransfers: true,
        viewFinancials: true,
        exportReports: true,
        manageUsers: true,
      };
    case 'مدير الفرع':
      return {
        manageBranches: false,
        manageProjects: true,
        manageTeams: true,
        manageWorkers: true,
        manageLeaves: true,
        manageLaborCases: true,
        manageEquipment: true,
        manageMaintenance: true,
        manageSpareParts: true,
        managePreventive: true,
        manageTransfers: true,
        viewFinancials: true,
        exportReports: true,
        manageUsers: false,
      };
    case 'مسؤول الفرع':
      return {
        manageBranches: false,
        manageProjects: false,
        manageTeams: true,
        manageWorkers: true,
        manageLeaves: true,
        manageLaborCases: true,
        manageEquipment: true,
        manageMaintenance: true,
        manageSpareParts: false,
        managePreventive: true,
        manageTransfers: true,
        viewFinancials: false,
        exportReports: true,
        manageUsers: false,
      };
    case 'مشرف الفريق':
      return {
        manageBranches: false,
        manageProjects: false,
        manageTeams: false,
        manageWorkers: false,
        manageLeaves: false,
        manageLaborCases: false,
        manageEquipment: false,
        manageMaintenance: true,
        manageSpareParts: false,
        managePreventive: false,
        manageTransfers: false,
        viewFinancials: false,
        exportReports: false,
        manageUsers: false,
      };
    case 'مسؤول الصيانة':
      return {
        manageBranches: false,
        manageProjects: false,
        manageTeams: false,
        manageWorkers: false,
        manageLeaves: false,
        manageLaborCases: false,
        manageEquipment: true,
        manageMaintenance: true,
        manageSpareParts: true,
        managePreventive: true,
        manageTransfers: true,
        viewFinancials: true,
        exportReports: true,
        manageUsers: false,
      };
    case 'مستخدم مشاهدة':
    default:
      return {
        manageBranches: false,
        manageProjects: false,
        manageTeams: false,
        manageWorkers: false,
        manageLeaves: false,
        manageLaborCases: false,
        manageEquipment: false,
        manageMaintenance: false,
        manageSpareParts: false,
        managePreventive: false,
        manageTransfers: false,
        viewFinancials: false,
        exportReports: true,
        manageUsers: false,
      };
  }
}

export const SYSTEM_USERS: UserProfile[] = [
  {
    id: 'user-gm',
    name: 'المهندس / أحمد بن عبدالعزيز آل سعود',
    role: 'المدير العام',
    username: 'gm',
    password: '123',
    branchId: undefined, // All branches
    branchName: 'الإدارة العامة - كافة الفروع',
    email: 'gm@ofooq-infra.sa',
    phone: '0500112233',
    isActive: true,
    createdAt: '2024-01-01',
    permissions: getDefaultPermissionsForRole('المدير العام'),
  },
  {
    id: 'user-central',
    name: 'أ. ماجد العتيبي',
    role: 'الإدارة المركزية',
    username: 'admin',
    password: '123',
    branchId: undefined,
    branchName: 'الإدارة المركزية للمتابعة',
    email: 'admin@ofooq-infra.sa',
    phone: '0505544332',
    isActive: true,
    createdAt: '2024-01-05',
    permissions: getDefaultPermissionsForRole('الإدارة المركزية'),
  },
  {
    id: 'user-mkh-mgr',
    name: 'م. فهد بن سالم الحربي',
    role: 'مدير الفرع',
    username: 'makkah',
    password: '123',
    branchId: 'branch-makkah',
    branchName: 'فرع مكة المكرمة',
    email: 'makkah.mgr@ofooq-infra.sa',
    phone: '0551122334',
    isActive: true,
    createdAt: '2024-02-10',
    permissions: getDefaultPermissionsForRole('مدير الفرع'),
  },
  {
    id: 'user-ryd-off',
    name: 'أ. سعد القحطاني',
    role: 'مسؤول الفرع',
    username: 'riyadh',
    password: '123',
    branchId: 'branch-riyadh',
    branchName: 'فرع الرياض',
    email: 's.qahtani@ofooq-infra.sa',
    phone: '0544332211',
    isActive: true,
    createdAt: '2024-02-15',
    permissions: getDefaultPermissionsForRole('مسؤول الفرع'),
  },
  {
    id: 'user-sup-ryd',
    name: 'أ. كريم عبدالمعطي',
    role: 'مشرف الفريق',
    username: 'supervisor',
    password: '123',
    branchId: 'branch-riyadh',
    branchName: 'فرع الرياض',
    teamId: 'team-ryd-01',
    email: 'karim.sup@ofooq-infra.sa',
    phone: '0566778899',
    isActive: true,
    createdAt: '2024-03-01',
    permissions: getDefaultPermissionsForRole('مشرف الفريق'),
  },
  {
    id: 'user-maint',
    name: 'م. سالم عطيف',
    role: 'مسؤول الصيانة',
    username: 'maintenance',
    password: '123',
    branchId: undefined,
    branchName: 'إدارة الصيانة والأسطول',
    email: 'maintenance@ofooq-infra.sa',
    phone: '0533221100',
    isActive: true,
    createdAt: '2024-03-10',
    permissions: getDefaultPermissionsForRole('مسؤول الصيانة'),
  },
  {
    id: 'user-viewer',
    name: 'أ. نايف السبيعي',
    role: 'مستخدم مشاهدة',
    username: 'viewer',
    password: '123',
    branchId: undefined,
    branchName: 'وحدة التدقيق والمشاهدة',
    email: 'viewer@ofooq-infra.sa',
    phone: '0599887766',
    isActive: true,
    createdAt: '2024-04-01',
    permissions: getDefaultPermissionsForRole('مستخدم مشاهدة'),
  },
];

export function getStoredData(): SystemData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.branches) && parsed.branches.length > 0) {
        // Ensure users array is present and includes baseline users
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = SYSTEM_USERS;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load stored system data', e);
  }
  // Fallback to initial seed data
  saveDataToStorage(INITIAL_SYSTEM_DATA);
  return INITIAL_SYSTEM_DATA;
}

export function saveDataToStorage(data: SystemData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('ofooq-data-updated'));
    // Fire background sync to backend API if available
    syncWithBackend(data).catch(() => {});
    // Fire background sync to Firebase Firestore
    import('../firebase/config').then((fb) => {
      fb.syncDataToFirestore(data).catch(() => {});
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save system data to localStorage', e);
  }
}

async function syncWithBackend(data: SystemData) {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Offline safe
  }
}

export async function fetchRemoteOrLocalData(): Promise<SystemData> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const json = await res.json();
      if (json && json.branches && json.branches.length > 0) {
        if (!json.users || json.users.length === 0) {
          json.users = SYSTEM_USERS;
        }
        saveDataToStorage(json);
        return json;
      }
    }
  } catch {
    // fallback
  }
  return getStoredData();
}

export function isUserAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(AUTH_SESSION_KEY);
    return session === 'true';
  } catch {
    return false;
  }
}

export function loginUser(user: UserProfile, remember: boolean = true) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, 'true');
    setCurrentUser(user);
    if (!remember) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    }
  } catch (e) {
    console.error('Error logging in user', e);
  }
}

export function logoutUser() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(new Event('ofooq-user-logged-out'));
  } catch (e) {
    console.error('Error logging out', e);
  }
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.id) {
        if (!u.permissions) {
          u.permissions = getDefaultPermissionsForRole(u.role);
        }
        return u;
      }
    }
  } catch {}
  return SYSTEM_USERS[0]; // Default to General Manager
}

export function setCurrentUser(user: UserProfile) {
  if (!user.permissions) {
    user.permissions = getDefaultPermissionsForRole(user.role);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('ofooq-user-changed'));
}

export function hasPermission(user: UserProfile, permissionKey: keyof UserPermissions): boolean {
  if (user.role === 'المدير العام') return true;
  if (user.permissions && user.permissions[permissionKey] !== undefined) {
    return !!user.permissions[permissionKey];
  }
  const defaultPerms = getDefaultPermissionsForRole(user.role);
  return !!defaultPerms[permissionKey];
}

export function logAction(
  data: SystemData,
  user: UserProfile,
  actionType: AuditLogItem['actionType'],
  entityType: AuditLogItem['entityType'],
  description: string,
  entityId?: string
): SystemData {
  const newLog: AuditLogItem = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    userName: user.name,
    userRole: user.role,
    branchId: user.branchId || 'ALL',
    branchName: user.branchName || 'الإدارة المركزية',
    actionType,
    entityType,
    entityId,
    description,
  };

  const updatedData: SystemData = {
    ...data,
    auditLogs: [newLog, ...(data.auditLogs || [])],
  };

  saveDataToStorage(updatedData);
  return updatedData;
}

export function addNotification(
  data: SystemData,
  title: string,
  message: string,
  type: AppNotification['type'],
  priority: AppNotification['priority'] = 'متوسط',
  targetTab?: string,
  branchId?: string
): SystemData {
  const newNotif: AppNotification = {
    id: 'notif-' + Date.now(),
    title,
    message,
    type,
    priority,
    date: 'الآن',
    read: false,
    targetTab,
    branchId,
  };

  const updatedData: SystemData = {
    ...data,
    notifications: [newNotif, ...(data.notifications || [])],
  };

  saveDataToStorage(updatedData);
  return updatedData;
}

export function canEditBranch(user: UserProfile, branchId?: string): boolean {
  if (user.role === 'مستخدم مشاهدة') return false;
  if (user.role === 'المدير العام' || user.role === 'الإدارة المركزية' || user.role === 'مسؤول الصيانة') return true;
  if (!user.branchId) return true;
  return user.branchId === branchId;
}

export function canManageEntities(user: UserProfile): boolean {
  return user.role !== 'مستخدم مشاهدة';
}
