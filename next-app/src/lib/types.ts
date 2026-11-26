export type WorkspaceId =
  | "landing"
  | "tenant-landing"
  | "platform"
  | "super-admin"
  | "tenant"
  | "tenant-super-admin"
  | "office-config"
  | "office"
  | "office-admin"
  | "department"
  | "member";

export type ThemeMode = "light" | "dark" | "system";
export type DensityMode = "comfortable" | "compact";

export type PlatformRole = "Platform Owner" | "Platform Admin" | "Platform User" | string;
export type TenantRole = "Tenant Admin" | "Tenant Manager" | "Tenant Member" | string;
export type OfficeRole = "Office Manager" | "Office Supervisor" | "Office Staff" | string;

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  platformRole: PlatformRole;
  status: string;
  createdAt: string;
}

export interface UserWithCounts extends User {
  tenantCount: number;
}

export interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  domain?: string;
  status: string;
  plan: string;
  createdAt: string;
}

export interface TenantWithCounts extends Tenant {
  officeCount: number;
  memberCount: number;
}

export interface Office {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  status: string;
  createdAt: string;
}

export interface OfficeWithCounts extends Office {
  staffCount: number;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  tenantRole: TenantRole;
  status: string;
  joinedAt: string;
}

export interface TenantMemberWithUser extends TenantMember {
  user: Pick<User, "id" | "name" | "email"> & Partial<User>;
}

export interface OfficeStaff {
  id: string;
  officeId: string;
  tenantId: string;
  userId: string;
  officeRole: OfficeRole;
  status: string;
  assignedAt: string;
}

export interface OfficeStaffWithUser extends OfficeStaff {
  user: Pick<User, "id" | "name" | "email"> & Partial<User>;
}

export interface OfficeWithDetails extends Office {
  tenant?: Tenant;
  staff: OfficeStaffWithUser[];
  staffCount: number;
}

export interface TenantWithDetails extends Tenant {
  offices: OfficeWithCounts[];
  members: TenantMemberWithUser[];
  officeCount: number;
  memberCount: number;
}

export interface UserTenantMembership extends TenantMember {
  tenantName: string;
}

export interface UserOfficeAssignment extends OfficeStaff {
  officeName: string;
  tenantName: string;
}

export interface UserDetails extends User {
  tenantMemberships: UserTenantMembership[];
  officeAssignments: UserOfficeAssignment[];
}

export interface Department {
  id: string;
  officeId: string;
  name: string;
  code: string;
  leadName: string;
  capacity: number;
  status: string;
  description: string;
  createdAt?: string;
}

export interface DepartmentMember {
  id: string;
  deptId: string;
  userId: string;
  deptRole: string;
  shift: string;
  status: string;
}

export interface DepartmentMemberWithUser extends DepartmentMember {
  user: {
    id?: string;
    name: string;
    email: string;
    platformRole?: string;
  };
}

export interface OfficeConfig {
  code: string;
  tier: string;
  floorArea: string;
  maxOccupancy: number;
  operatingHours: string;
  primaryContact: string;
  emergencyContact: string;
  shifts: string[];
  checkInGrace: string;
  accessControlMode: string;
}

export interface MemberTask {
  id: string;
  userId: string;
  deptId: string;
  title: string;
  status: string;
  priority: string;
  dueTime: string;
  category: string;
}

export interface MemberActivity {
  id: string;
  userId: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface RolesByLevel {
  platform: RoleDefinition[];
  tenant: RoleDefinition[];
  office: RoleDefinition[];
  [key: string]: RoleDefinition[];
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  timestamp: string;
}

export interface OperationalDeliverable {
  name: string;
  token: string;
  equation: string;
}

export interface OperationalFile {
  id: string;
  type: "project" | "product" | string;
  fileCode: string;
  title: string;
  officeId: string;
  tenantId: string;
  clientName: string;
  clientCode: string;
  billingTerms: string;
  status: string;
  vesselName?: string;
  portCall?: string;
  terminal?: string;
  voyageNo?: string;
  grt?: number;
  nrt?: number;
  arrivalDate?: string;
  berthingDate?: string;
  departureDate?: string;
  scheduledDates?: string;
  sku?: string;
  baseUnitPrice?: number;
  stockOnHand?: string;
  defaultDeliverables: OperationalDeliverable[];
}

export interface PremadeDeliverable {
  token: string;
  name: string;
  equation: string;
  category: string;
}

export interface TemplateHeaderField {
  key: string;
  label: string;
  value: string;
}

export interface HeaderGridCell {
  id: string;
  row: number;
  col: number;
  colspan: number;
  rowspan: number;
  key?: string;
  label?: string;
  value?: string;
  empty?: boolean;
}

export interface HeaderGrid {
  colsCount: number;
  rowsCount: number;
  cells: HeaderGridCell[];
}

export interface TemplateRow {
  id: string;
  token: string;
  name: string;
  equation: string;
  sl?: number;
  editable?: string;
}

export interface TemplateCharge {
  id: string;
  token: string;
  name: string;
  equation: string;
  editable?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  color?: string;
  rows: TemplateRow[];
  charges?: TemplateCharge[];
  subtotal: {
    token: string;
    label: string;
    equation: string;
  };
}

export interface InvoiceTemplate {
  id: string;
  officeId: string;
  tenantId: string;
  name: string;
  type?: string;
  description?: string;
  code: string;
  tag?: string;
  status: string;
  isDefault: boolean;
  currency: string;
  currencySymbol: string;
  clientName?: string;
  clientCode?: string;
  billingTerms?: string;
  sourceFileId?: string | null;
  sourceFileType?: string | null;
  createdAt: string;
  updatedAt: string;
  headerFields?: TemplateHeaderField[];
  headerGrid?: HeaderGrid;
  globalConstants: Record<string, number>;
  localConstants: Record<string, number>;
  sections: TemplateSection[];
  grandTotal: {
    token: string;
    label: string;
    equation: string;
  };
}

export interface PlatformStateData {
  currentUser: CurrentUser;
  users: User[];
  tenants: Tenant[];
  offices: Office[];
  tenantMembers: TenantMember[];
  officeStaff: OfficeStaff[];
  departments: Department[];
  departmentMembers: DepartmentMember[];
  officeConfigs: Record<string, OfficeConfig>;
  memberTasks: MemberTask[];
  memberActivity: MemberActivity[];
  roles: RolesByLevel;
  auditLogs: AuditLogEntry[];
  operationalFiles: OperationalFile[];
  premadeDeliverables: PremadeDeliverable[];
  invoiceTemplates: InvoiceTemplate[];
}

export interface PanelUserInfo {
  name: string;
  role: string;
  email: string;
  address: string;
  phone?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  avatar: string;
  avatarBg: string;
  photo?: string;
}

export type IconName =
  | "overview"
  | "tenants"
  | "offices"
  | "users"
  | "roles"
  | "audit"
  | "search"
  | "plus"
  | "edit"
  | "trash"
  | "close"
  | "chevronRight"
  | "chevronLeft"
  | "chevronDown"
  | "arrowRight"
  | "bell"
  | "menu"
  | "info"
  | "alert"
  | "power"
  | "pause"
  | "play"
  | "phone"
  | "check"
  | "refresh"
  | "settings"
  | "building"
  | "department"
  | "file"
  | "dollar"
  | "shield"
  | "invoice"
  | "activity"
  | "layers"
  | "globe"
  | "folder"
  | "folderClosed"
  | "folderOpen"
  | "mapPin"
  | "building2"
  | "expand"
  | "collapse"
  | "moreHorizontal"
  | "moreVertical"
  | "archive"
  | "sun"
  | "moon";
