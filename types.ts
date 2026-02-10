export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_CUSTOMER = 'AWAITING_CUSTOMER',
  RESOLVED = 'RESOLVED', // Agent thinks it's done, waiting for user
  CLOSED = 'CLOSED' // User confirmed
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Category {
  TECHNICAL = 'Technical Support',
  FINANCE = 'Finance',
  SALES = 'Sales',
  GENERAL = 'General Inquiry',
  UNCLASSIFIED = 'Unclassified'
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  FRUSTRATED = 'Frustrated',
  ANGRY = 'Angry'
}

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export enum AppPermission {
  // Ticket Permissions
  VIEW_OWN_TICKETS = 'VIEW_OWN_TICKETS',
  VIEW_ALL_TICKETS = 'VIEW_ALL_TICKETS', // Global Admin Queue
  VIEW_DEPARTMENT_TICKETS = 'VIEW_DEPARTMENT_TICKETS', // Department/Assigned Queue
  CREATE_TICKET = 'CREATE_TICKET',
  MANAGE_TICKETS = 'MANAGE_TICKETS', // Edit status, assign, internal notes
  ESCALATE_TICKETS = 'ESCALATE_TICKETS', // New
  
  // Asset Permissions
  VIEW_MY_ASSETS = 'VIEW_MY_ASSETS',
  VIEW_ALL_ASSETS = 'VIEW_ALL_ASSETS',
  MANAGE_ASSETS = 'MANAGE_ASSETS', // Create/Edit/Delete assets
  RUN_DIAGNOSTICS = 'RUN_DIAGNOSTICS',

  // System Permissions
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_SYSTEM = 'MANAGE_SYSTEM', // Super Admin configs
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',

  // Escalation Permissions (New)
  MANAGE_ESCALATION_GROUPS = 'MANAGE_ESCALATION_GROUPS',
  VIEW_ESCALATION_GROUPS = 'VIEW_ESCALATION_GROUPS',
  MANAGE_ESCALATION_RULES = 'MANAGE_ESCALATION_RULES',
  VIEW_ESCALATION_RULES = 'VIEW_ESCALATION_RULES',
}

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  CUSTOMER: [
    AppPermission.VIEW_OWN_TICKETS,
    AppPermission.CREATE_TICKET,
    AppPermission.VIEW_MY_ASSETS
  ],
  AGENT: [
    AppPermission.VIEW_OWN_TICKETS, // Agents can also be customers
    AppPermission.CREATE_TICKET,
    AppPermission.VIEW_DEPARTMENT_TICKETS, // Restricted view
    AppPermission.MANAGE_TICKETS,
    AppPermission.ESCALATE_TICKETS,
    AppPermission.VIEW_ALL_ASSETS,
    AppPermission.VIEW_MY_ASSETS,
    AppPermission.RUN_DIAGNOSTICS,
    AppPermission.VIEW_ANALYTICS,
    AppPermission.VIEW_ESCALATION_GROUPS
  ],
  ADMIN: [
    AppPermission.VIEW_OWN_TICKETS,
    AppPermission.CREATE_TICKET,
    AppPermission.VIEW_ALL_TICKETS,
    AppPermission.MANAGE_TICKETS,
    AppPermission.ESCALATE_TICKETS,
    AppPermission.VIEW_ALL_ASSETS,
    AppPermission.VIEW_MY_ASSETS,
    AppPermission.MANAGE_ASSETS,
    AppPermission.RUN_DIAGNOSTICS,
    AppPermission.VIEW_ANALYTICS,
    AppPermission.MANAGE_USERS,
    AppPermission.MANAGE_ESCALATION_GROUPS,
    AppPermission.VIEW_ESCALATION_GROUPS,
    AppPermission.MANAGE_ESCALATION_RULES,
    AppPermission.VIEW_ESCALATION_RULES
  ],
  SUPER_ADMIN: [
    AppPermission.VIEW_OWN_TICKETS,
    AppPermission.CREATE_TICKET,
    AppPermission.VIEW_ALL_TICKETS,
    AppPermission.MANAGE_TICKETS,
    AppPermission.ESCALATE_TICKETS,
    AppPermission.VIEW_ALL_ASSETS,
    AppPermission.VIEW_MY_ASSETS,
    AppPermission.MANAGE_ASSETS,
    AppPermission.RUN_DIAGNOSTICS,
    AppPermission.VIEW_ANALYTICS,
    AppPermission.MANAGE_USERS,
    AppPermission.MANAGE_SYSTEM,
    AppPermission.VIEW_AUDIT_LOGS,
    AppPermission.MANAGE_ESCALATION_GROUPS,
    AppPermission.VIEW_ESCALATION_GROUPS,
    AppPermission.MANAGE_ESCALATION_RULES,
    AppPermission.VIEW_ESCALATION_RULES
  ]
};

export interface User {
  id: string;
  email: string; // Added for auth
  password?: string; // Mock password (in real app, this is never on frontend)
  name: string;
  role: UserRole;
  avatar: string;
  departmentId?: string; // Link user to department
  // Intelligent Assignment fields
  skills?: Category[]; 
  efficiencyRating?: number; 
  activeTicketCount?: number;
  assetFamiliarityScore?: Record<string, number>; 
  status?: 'ACTIVE' | 'SUSPENDED'; // For admin control
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isInternal: boolean;
}

export enum AssetType {
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  PERIPHERAL = 'Peripheral',
  NETWORK = 'Network',
  SERVER = 'Server'
}

export enum AssetStatus {
  IN_USE = 'In Use',
  IN_STOCK = 'In Stock',
  MAINTENANCE = 'Under Maintenance',
  RETIRED = 'Retired',
  DISPOSED = 'Disposed'
}

export enum AssetCondition {
  NEW = 'New',
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  BROKEN = 'Broken'
}

// --- New Registry Entities ---

export interface Brand {
  id: string;
  name: string;
  website?: string;
  supportContact?: string;
  logoUrl?: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  category: AssetType;
  specsTemplate?: Record<string, string>; // Default specs
  warrantyPeriodMonths: number;
  imageUrl?: string;
  eolDate?: number; // End of Life
}

export interface Department {
  id: string;
  name: string;
  parentId?: string; // For hierarchy (Company -> Div -> Dept)
  costCenter: string;
  managerId?: string;
}

// --- New Asset Segmentation ---

export interface AssetCategory {
  id: string;
  name: string;
  icon: string; // e.g., 'desktop', 'laptop', 'server'
  description?: string;
}

export interface AssetSubcategory {
  id: string;
  categoryId: string;
  name: string;
  specificationsTemplate: Record<string, string>;
}

// --- Reporting & Feedback Types ---

export interface AssetHealthMetric {
  name: string; // e.g., "Battery Health", "CPU Load"
  value: string | number; // e.g., "85%", 45
  status: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface AssetReport {
  id: string;
  assetId: string;
  generatedAt: number;
  generatedBy: string; // Agent ID
  overallHealthScore: number; // 0-100
  metrics: AssetHealthMetric[];
  aiRecommendations: string[];
  rawLogSummary?: string;
}

export interface Feedback {
  id: string;
  ticketId: string;
  userId: string;
  timestamp: number;
  ratings: {
    overall: number; // 1-10
    technical: number;
    courtesy: number;
    timeliness: number;
  };
  comment?: string;
  aiAnalysis?: {
    sentimentScore: number; // 0-100
    coachingTips: string;
    themes: string[];
  };
}

export interface Asset {
  id: string;
  assetCode: string; // e.g., AST-2024-001
  
  // Categorization
  categoryId: string;
  subcategoryId?: string;
  
  // Registry Links (Legacy support + new structure)
  brandId: string;
  modelId: string;
  departmentId?: string; 
  
  // Core Info
  name: string; // Friendly name (e.g., "Alice's Laptop")
  serialNumber: string;
  type: AssetType; // Deprecated conceptually, effectively mapped to Category
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  
  // Hierarchy
  parentId?: string; // The asset this is attached to (e.g. Monitor -> Desktop)

  // Technical Details
  ipAddress?: string;
  macAddress?: string;
  lastMaintenanceDate?: number;
  nextMaintenanceDate?: number;

  // Lifecycle & Financials
  purchaseDate: number;
  purchaseCost: number;
  supplier?: string;
  invoiceNumber?: string;
  warrantyExpiry: number;
  
  assignedTo?: string; // userId
  assignmentDate?: number;

  // Specifications Bag (Flexible JSONB equivalent)
  specs?: Record<string, string>; // Specific specs (overrides model template)
  
  // AI/Integrations
  lastScanDate?: number;
  predictedFailureRisk?: number; // 0-100
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  sentiment: Sentiment;
  createdAt: number;
  updatedAt: number;
  customerId: string;
  assignedAgentId?: string;
  assignedGroupId?: string; // For Group Assignment
  linkedAssetId?: string;
  messages: Message[];
  customFields?: Record<string, string>;
  feedbackId?: string; // Link to feedback
  aiAnalysis?: {
    confidence: number;
    suggestedSolution?: string;
    rootCauseAnalysis?: string;
    summary?: string;
    riskAssessment?: string;
  };
  
  // SLA Fields
  slaTarget: number; // Timestamp when ticket breaches
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  slaTier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Standard';
  demandFactorApplied: number; // The multiplier used (e.g., 1.2x)
  isEscalated?: boolean; // New Flag
}

// --- Escalation & Group Types ---

export enum EscalationGroupType {
  TECHNICAL = 'TECHNICAL',
  FUNCTIONAL = 'FUNCTIONAL',
  HIERARCHICAL = 'HIERARCHICAL',
  REGIONAL = 'REGIONAL'
}

export enum EscalationGroupMemberRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
  BACKUP = 'BACKUP',
  ESCALATION_POINT = 'ESCALATION_POINT'
}

export interface EscalationGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: EscalationGroupType;
  category?: Category | string;
  level: number; // 1, 2, 3
  
  // SLA & Ops
  responseSlaMinutes: number;
  resolutionSlaMinutes?: number;
  contactEmail?: string;
  
  // Stats
  activeTickets?: number;
  assignedTickets?: number;
  maxConcurrentTickets?: number;
  
  autoAssign: boolean;
  isActive: boolean;
  availabilitySchedule?: string; // Simple string description for demo
}

export interface EscalationGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: EscalationGroupMemberRole;
  weeklyCapacityHours: number;
}

export interface EscalationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: 'TIME_BASED' | 'STATUS_BASED' | 'PRIORITY_BASED' | 'MANUAL';
  condition: {
    priority?: Priority;
    category?: Category;
    slaStatus?: 'BREACHED' | 'AT_RISK';
  };
  action: {
    targetGroupId?: string; // Assign to Group
    assignToUserId?: string; // Fallback or direct override
    newPriority?: Priority;
    note: string;
  };
  isActive: boolean;
}

// AI Service Types
export interface TicketAnalysisResult {
  category: Category;
  priority: Priority;
  sentiment: Sentiment;
  confidence: number;
  kbSuggestion?: string;
}

export interface AnalyticsResponse {
  summary: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  chartData: { label: string; value: number }[];
  suggestedAction: string;
}

export interface AgentScore {
  agent: User;
  totalScore: number;
  breakdown: {
    skillMatch: number;
    history: number;
    workload: number;
    assetFamiliarity: number;
  };
}

// --- Admin & Security Types ---

export interface AuditLog {
  id: string;
  actorId: string; // Who did it
  actorName: string;
  action: string; // e.g., "USER_DELETE", "SYSTEM_LOCKDOWN"
  targetId?: string; // ID of affected entity
  details: string;
  timestamp: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  lockdownMode: boolean;
  allowNewRegistrations: boolean;
  systemVersion: string;
  lastBackupAt: number;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptime: number;
  activeUsers: number;
  databaseLatency: number;
  pendingJobs: number;
}