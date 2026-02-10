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
  // Registry Links
  brandId: string;
  modelId: string;
  departmentId?: string; 
  
  // Core Info
  name: string; // Friendly name (e.g., "Alice's Laptop")
  serialNumber: string;
  type: AssetType;
  status: AssetStatus;
  condition: AssetCondition;
  
  // Hierarchy
  parentId?: string; // The asset this is attached to (e.g. Monitor -> Desktop)

  // Lifecycle & Financials
  purchaseDate: number;
  purchaseCost: number;
  supplier?: string;
  warrantyExpiry: number;
  
  assignedTo?: string; // userId
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