export type UserRole =
  | 'المدير العام'
  | 'الإدارة المركزية'
  | 'مدير الفرع'
  | 'مسؤول الفرع'
  | 'مشرف الفريق'
  | 'مسؤول الصيانة'
  | 'مستخدم مشاهدة';

export interface UserPermissions {
  manageBranches: boolean; // إضافة وتعديل الفروع
  manageProjects: boolean; // إدارة المشاريع
  manageTeams: boolean; // إدارة الفرق
  manageWorkers: boolean; // إدارة العمالة والوثائق والكفالات
  manageLeaves: boolean; // إدارة إجازات العمال
  manageLaborCases: boolean; // إدارة القضايا والمشاكل العمالية
  manageEquipment: boolean; // إدارة المعدات والآليات
  manageMaintenance: boolean; // فتح وإغلاق بلاغات الصيانة ومراحل الإصلاح
  manageSpareParts: boolean; // إدارة قطع الغيار والمستودع
  managePreventive: boolean; // جدولة الصيانة الوقائية
  manageTransfers: boolean; // نقل المعدات والعمال بين الفروع
  viewFinancials: boolean; // الاطلاع على تكاليف الصيانة والمصروفات
  exportReports: boolean; // تصدير وطباعة التقارير
  manageUsers: boolean; // إنشاء وإدارة حسابات الموظفين والصلاحيات
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  username?: string;
  password?: string;
  branchId?: string; // If undefined or 'ALL', has central access
  branchName?: string;
  teamId?: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  permissions?: UserPermissions;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  managerName: string;
  adminOfficer: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'نشط' | 'تحت التوسعة' | 'مؤقت';
  notes?: string;
  createdDate: string;
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  client: string;
  branchId: string;
  location: string;
  manager: string;
  supervisor: string;
  status: 'نشط' | 'قيد التنفيذ' | 'مكتمل' | 'متوقف';
  startDate: string;
  expectedEndDate: string;
  completionPercentage: number;
  assignedTeamsCount?: number;
  notes?: string;
}

export interface Team {
  id: string;
  teamNumber: string;
  name: string;
  branchId: string;
  projectId?: string;
  supervisor: string;
  workType: string;
  location: string;
  workersCount: number;
  status: 'ميداني نشط' | 'في الموقع' | 'في وضع الاستعداد' | 'معلق';
  createdAt: string;
  notes?: string;
}

export interface WorkerDocument {
  id: string;
  title: string;
  type: 'إقامة' | 'عقد' | 'جواز سفر' | 'رخصة قيادة معدات' | 'تأمين' | 'أخرى';
  fileName: string;
  fileUrl?: string;
  uploadDate: string;
  size?: string;
}

export interface WorkerTransferRecord {
  id: string;
  date: string;
  fromBranch: string;
  toBranch: string;
  fromTeam: string;
  toTeam: string;
  reason: string;
  approvedBy: string;
  notes?: string;
}

export type WorkerStatus =
  | 'على رأس العمل'
  | 'إجازة'
  | 'غياب'
  | 'موقوف'
  | 'منقول'
  | 'خارج الكفالة'
  | 'على كفالة الشركة'
  | 'منتهي الخدمة';

export interface Worker {
  id: string;
  employeeNumber: string;
  fullName: string;
  nationality: string;
  jobTitle: string;
  phone: string;
  branchId: string;
  teamId: string;
  projectId?: string;
  supervisor: string;
  status: WorkerStatus;
  hireDate: string;
  contractEndDate: string;
  residencyStatus: 'سارية' | 'قاربت على الانتهاء' | 'منتهية';
  residencyExpiryDate: string;
  insuranceStatus: 'ساري' | 'منتهي' | 'غير متوفر';
  isCompanySponsorship: boolean; // هل على كفالة الشركة أم خارج كفالتها
  sponsorshipStartDate?: string;
  sponsorshipEndDate?: string;
  documents: WorkerDocument[];
  transferHistory: WorkerTransferRecord[];
  notes?: string;
}

export interface WorkerLeave {
  id: string;
  workerId: string;
  workerName: string;
  employeeNumber: string;
  branchId: string;
  teamId: string;
  leaveType: 'سنوية' | 'مرضية' | 'طارئة' | 'غير مدفوعة' | 'رسمية';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'سارية' | 'مجدولة' | 'منتهية' | 'مقطوعة';
  notes?: string;
}

export type CaseStatus =
  | 'جديدة'
  | 'قيد المتابعة'
  | 'تحتاج إجراء'
  | 'لدى الجهة المختصة'
  | 'مغلقة'
  | 'تم حلها';

export interface LaborCase {
  id: string;
  caseNumber: string;
  workerId: string;
  workerName: string;
  employeeNumber: string;
  branchId: string;
  teamId: string;
  issueType: 'خلاف تعاقدي' | 'مطالبة مالية' | 'إصابة عمل' | 'بلاغ انقطاع' | 'شكوى مكتب العمل' | 'سلوك وظيفي';
  description: string;
  reportDate: string;
  authority: 'مكتب العمل واللجان الابتدائية' | 'المحكمة العمالية' | 'الصلح الودي الداخلي' | 'التأمينات الاجتماعية' | 'الشرطة / المرور';
  authorityCaseNumber?: string;
  status: CaseStatus;
  actionsTaken: string;
  lastUpdateDate: string;
  nextAppointmentDate?: string;
  followUpOfficer: string;
  documents: WorkerDocument[];
  notes?: string;
}

export type EquipmentStatus =
  | 'تعمل'
  | 'متوقفة'
  | 'في الصيانة'
  | 'تحت الفحص'
  | 'خارج الخدمة'
  | 'تم بيعها / إخراجها من الخدمة';

export interface EquipmentTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'استلام' | 'صيانة' | 'عطل' | 'نقل' | 'فحص' | 'تشغيل';
  performedBy: string;
  cost?: number;
  referenceNumber?: string;
}

export interface EquipmentTransferRecord {
  id: string;
  date: string;
  equipmentId: string;
  equipmentNumber: string;
  equipmentName: string;
  fromBranch: string;
  toBranch: string;
  reason: string;
  officer: string;
  equipmentCondition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'متوقفة';
  documentName?: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  equipmentNumber: string;
  name: string;
  type: string; // حفار، بلدوزر، لودر، شاحنة قلاب، إلخ
  brand: string; // كاتربيلر، كوماتسو، فولفو، إلخ
  model: string;
  manufactureYear: number;
  serialNumber: string;
  plateNumber?: string;
  branchId: string;
  teamId?: string;
  projectId?: string;
  location: string;
  operatorName: string;
  status: EquipmentStatus;
  entryDate: string;
  operatingStartDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  operatingHours: number;
  notes?: string;
  timeline: EquipmentTimelineEvent[];
  documents?: WorkerDocument[];
}

export type PriorityLevel = 'عاجل' | 'مرتفع' | 'متوسط' | 'منخفض';

export interface MaintenanceStageRecord {
  stageIndex: number;
  stageName: string;
  timestamp?: string;
  completedBy?: string;
  notes?: string;
  isCompleted: boolean;
  attachments?: string[];
}

export interface MaintenancePartItem {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MaintenanceReport {
  id: string;
  reportNumber: string;
  equipmentId: string;
  equipmentNumber: string;
  equipmentName: string;
  branchId: string;
  teamId?: string;
  projectId?: string;
  reportDate: string;
  reporterName: string;
  faultType: string;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
  priority: PriorityLevel;
  currentStageIndex: number; // 0 to 9 representing the 10 stages
  stagesHistory: MaintenanceStageRecord[];
  sparePartsUsed: MaintenancePartItem[];
  partsCost: number;
  laborCost: number;
  workshopCost: number;
  otherCost: number;
  totalCost: number;
  status: 'مفتوح' | 'قيد التنفيذ' | 'مكتمل' | 'ملغي';
  closedAt?: string;
  downtimeHours?: number;
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  compatibleEquipment: string;
  supplier: string;
  unitPrice: number;
  quantityInStock: number;
  minimumThreshold: number;
  orderDate?: string;
  receivedDate?: string;
  status: 'متوفر' | 'منخفض' | 'تم الطلب' | 'بانتظار الاستلام';
  notes?: string;
}

export interface PreventiveMaintenancePlan {
  id: string;
  equipmentId: string;
  equipmentNumber: string;
  equipmentName: string;
  branchId: string;
  nextDueDate: string;
  maintenanceType: string;
  currentOperatingHours: number;
  scheduledHours: number;
  lastServiceDate: string;
  technicianName: string;
  estimatedCost: number;
  notes?: string;
  status: 'مجدولة' | 'قادمة قريباً' | 'متأخرة' | 'مكتملة';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  branchId?: string;
  branchName?: string;
  actionType: 'إضافة' | 'تعديل' | 'حذف' | 'نقل' | 'تحديث مرحلة صيانة' | 'إغلاق بلاغ' | 'رفع مستند' | 'تسجيل إجازة';
  entityType: 'معدة' | 'عامل' | 'فرع' | 'فريق' | 'بلاغ صيانة' | 'قضية' | 'قطعة غيار' | 'مشروع' | 'إجازة';
  entityId?: string;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'إجازات' | 'إقامات' | 'صيانة' | 'أعطال' | 'قضايا' | 'قطع غيار' | 'نقل';
  priority: 'عالي' | 'متوسط' | 'تنبيه';
  date: string;
  read: boolean;
  targetTab?: string;
  branchId?: string;
}

export interface SystemData {
  branches: Branch[];
  projects: Project[];
  teams: Team[];
  workers: Worker[];
  leaves: WorkerLeave[];
  laborCases: LaborCase[];
  equipment: Equipment[];
  maintenanceReports: MaintenanceReport[];
  spareParts: SparePart[];
  preventivePlans: PreventiveMaintenancePlan[];
  auditLogs: AuditLogItem[];
  notifications: AppNotification[];
  equipmentTransfers: EquipmentTransferRecord[];
  users: UserProfile[];
}
