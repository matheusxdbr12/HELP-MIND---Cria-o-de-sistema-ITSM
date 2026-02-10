export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_CUSTOMER = 'AWAITING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
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

export interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  avatar: string;
  departmentId?: string; // Link user to department
  // Intelligent Assignment fields
  skills?: Category[]; 
  efficiencyRating?: number; 
  activeTicketCount?: number;
  assetFamiliarityScore?: Record<string, number>; 
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
