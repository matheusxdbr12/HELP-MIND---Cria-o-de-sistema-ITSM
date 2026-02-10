import { Ticket, User, TicketStatus, Priority, Category, Sentiment, Message, Asset, AssetType, AssetStatus, AgentScore, Brand, Model, Department, AssetCondition, Feedback, AssetReport, AuditLog, SystemConfig, SystemHealth, EscalationRule, AssetCategory, AssetSubcategory } from "../types";
import { calculateSLADeadline, getSLAStatus } from "./slaService";

// --- Registries ---

export const BRANDS: Brand[] = [
  { id: 'B-DELL', name: 'Dell', website: 'dell.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { id: 'B-APPLE', name: 'Apple', website: 'apple.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'B-ADOBE', name: 'Adobe', website: 'adobe.com' },
  { id: 'B-HP', name: 'HP', website: 'hp.com' }
];

export const ASSET_CATEGORIES: AssetCategory[] = [
    { id: 'CAT-COMP', name: 'Computers', icon: 'desktop', description: 'Desktop computers and workstations' },
    { id: 'CAT-NOTE', name: 'Notebooks', icon: 'laptop', description: 'Laptops and notebooks' },
    { id: 'CAT-MON', name: 'Monitors', icon: 'monitor', description: 'Computer monitors and displays' },
    { id: 'CAT-PERI', name: 'Peripherals', icon: 'mouse', description: 'Input/output devices' },
    { id: 'CAT-SERV', name: 'Servers', icon: 'server', description: 'Server hardware' },
    { id: 'CAT-NET', name: 'Networking', icon: 'network', description: 'Network equipment' },
    { id: 'CAT-SOFT', name: 'Software', icon: 'code', description: 'Licenses and Cloud Subs' }
];

export const ASSET_SUBCATEGORIES: AssetSubcategory[] = [
    { id: 'SUB-NB-ULTRA', categoryId: 'CAT-NOTE', name: 'Ultrabook', specificationsTemplate: { "screen_size": "", "cpu": "", "ram": "" } },
    { id: 'SUB-NB-WORK', categoryId: 'CAT-NOTE', name: 'Workstation', specificationsTemplate: { "gpu": "", "cpu": "", "ram": "" } },
    { id: 'SUB-MON-LED', categoryId: 'CAT-MON', name: 'LED Monitor', specificationsTemplate: { "size": "", "resolution": "" } },
    { id: 'SUB-PERI-ACC', categoryId: 'CAT-PERI', name: 'Accessory', specificationsTemplate: { "type": "" } },
    { id: 'SUB-SERV-RACK', categoryId: 'CAT-SERV', name: 'Rack Server', specificationsTemplate: { "u_size": "", "cpu_sockets": "" } },
    { id: 'SUB-SOFT-SUB', categoryId: 'CAT-SOFT', name: 'Subscription', specificationsTemplate: { "renewal": "" } }
];

export const MODELS: Model[] = [
  { 
    id: 'M-XPS15', brandId: 'B-DELL', name: 'XPS 15 9530', category: AssetType.HARDWARE, 
    warrantyPeriodMonths: 12, imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=200&q=80',
    specsTemplate: { "CPU": "Intel Core i7/i9", "RAM": "16GB/32GB", "OS": "Windows 11" }
  },
  { 
    id: 'M-MBA-M2', brandId: 'B-APPLE', name: 'MacBook Air M2', category: AssetType.HARDWARE, 
    warrantyPeriodMonths: 12, imageUrl: 'https://images.unsplash.com/photo-1611186871348-d18c5c944060?auto=format&fit=crop&w=200&q=80',
    specsTemplate: { "CPU": "Apple M2", "RAM": "8GB/16GB", "Storage": "256GB/512GB" }
  },
  { 
    id: 'M-ADOBE-CC', brandId: 'B-ADOBE', name: 'Creative Cloud All Apps', category: AssetType.SOFTWARE, 
    warrantyPeriodMonths: 12, 
    specsTemplate: { "License": "Subscription", "Updates": "Automatic" }
  },
  {
    id: 'M-HP-SERVER', brandId: 'B-HP', name: 'ProLiant DL380 Gen10', category: AssetType.SERVER,
    warrantyPeriodMonths: 36,
    specsTemplate: { "CPU": "Xeon Gold", "RAM": "64GB ECC", "Storage": "RAID 5" }
  },
  {
    id: 'M-DELL-MON', brandId: 'B-DELL', name: 'UltraSharp U2723QE', category: AssetType.PERIPHERAL,
    warrantyPeriodMonths: 36,
    specsTemplate: { "Size": "27 inch", "Res": "4K" }
  }
];

export const DEPARTMENTS: Department[] = [
  { id: 'D-ENG', name: 'Engineering', costCenter: 'CC-101' },
  { id: 'D-DES', name: 'Design', costCenter: 'CC-102' },
  { id: 'D-FIN', name: 'Finance', costCenter: 'CC-201' },
  { id: 'D-IT', name: 'IT Operations', costCenter: 'CC-900' }
];

// --- Mock Users ---

export let USERS: Record<string, User> = {
  'user1': { 
    id: 'user1', email: 'alice@company.com', password: 'password', name: 'Alice Customer', role: 'CUSTOMER', avatar: 'https://picsum.photos/id/64/100/100', departmentId: 'D-DES', status: 'ACTIVE'
  },
  'agent1': { 
    id: 'agent1', email: 'bob@helpmind.com', password: 'password', name: 'Bob Agent (Tech)', role: 'AGENT', avatar: 'https://picsum.photos/id/1005/100/100', departmentId: 'D-IT', status: 'ACTIVE',
    skills: [Category.TECHNICAL, Category.GENERAL],
    efficiencyRating: 88,
    activeTicketCount: 3,
    assetFamiliarityScore: { 'XPS 15 9530': 95 }
  },
  'agent2': { 
    id: 'agent2', email: 'sarah@helpmind.com', password: 'password', name: 'Sarah Finance', role: 'AGENT', avatar: 'https://picsum.photos/id/1011/100/100', departmentId: 'D-FIN', status: 'ACTIVE',
    skills: [Category.FINANCE, Category.SALES],
    efficiencyRating: 92,
    activeTicketCount: 1,
    assetFamiliarityScore: {}
  },
  'admin1': {
      id: 'admin1', email: 'admin@helpmind.com', password: 'password', name: 'System Administrator', role: 'SUPER_ADMIN', avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=1e293b&color=fff', status: 'ACTIVE'
  },
  'manager1': {
      id: 'manager1', email: 'manager@helpmind.com', password: 'password', name: 'Ops Manager', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Ops+Manager&background=6366f1&color=fff', status: 'ACTIVE'
  }
};

// --- Escalation Rules Store ---
let escalationRules: EscalationRule[] = [
    {
        id: 'rule-1',
        name: 'Critical Breach -> Admin',
        isActive: true,
        condition: { priority: Priority.CRITICAL, slaStatus: 'BREACHED' },
        action: { assignToUserId: 'admin1', note: 'Escalated to Admin due to Critical SLA Breach' }
    },
    {
        id: 'rule-2',
        name: 'High Priority Tech -> Manager',
        isActive: true,
        condition: { priority: Priority.HIGH, category: Category.TECHNICAL, slaStatus: 'BREACHED' },
        action: { assignToUserId: 'manager1', note: 'Escalated to Ops Manager due to High Priority Tech breach.' }
    }
];

// --- Admin & Security Stores ---
let auditLogs: AuditLog[] = [
    { id: 'log-1', actorId: 'system', actorName: 'System Boot', action: 'SYSTEM_STARTUP', details: 'Services initialized', timestamp: Date.now() - 1000000, severity: 'INFO', ipAddress: '127.0.0.1' },
    { id: 'log-2', actorId: 'user1', actorName: 'Alice Customer', action: 'LOGIN_SUCCESS', details: 'User logged in via Web', timestamp: Date.now() - 500000, severity: 'INFO', ipAddress: '192.168.1.50' }
];

let systemConfig: SystemConfig = {
    maintenanceMode: false,
    lockdownMode: false,
    allowNewRegistrations: true,
    systemVersion: '2.4.0-RC1',
    lastBackupAt: Date.now() - 86400000
};

// --- Mock Data Containers ---
// Helper for init
const initSLA = (priority: Priority, created: number) => {
    return calculateSLADeadline(priority, created);
};

const t1Created = Date.now() - 86400000;
const t1SLA = initSLA(Priority.HIGH, t1Created);

let tickets: Ticket[] = [
  {
    id: 'T-1001',
    title: 'Login failing on mobile app',
    description: 'I cannot log in to the IOS app after the latest update.',
    category: Category.TECHNICAL,
    priority: Priority.HIGH,
    status: TicketStatus.OPEN,
    sentiment: Sentiment.FRUSTRATED,
    createdAt: t1Created,
    updatedAt: Date.now() - 86000000,
    customerId: 'user1',
    messages: [
      { id: 'm1', ticketId: 'T-1001', senderId: 'user1', senderName: 'Alice Customer', content: 'I cannot log in to the IOS app after the latest update.', timestamp: t1Created, isInternal: false }
    ],
    slaTarget: t1SLA.target,
    slaStatus: 'BREACHED', // Manually set for mock demo
    slaTier: t1SLA.tier,
    demandFactorApplied: t1SLA.demandFactor,
    isEscalated: false
  }
];

let assets: Asset[] = [
  {
    id: 'A-101',
    assetCode: 'AST-2023-001',
    brandId: 'B-DELL', modelId: 'M-XPS15', departmentId: 'D-DES',
    categoryId: 'CAT-NOTE', subcategoryId: 'SUB-NB-WORK',
    name: "Alice's Workstation", serialNumber: "DXPS-998877",
    type: AssetType.HARDWARE, status: AssetStatus.IN_USE, condition: AssetCondition.GOOD,
    purchaseDate: Date.now() - 31536000000, purchaseCost: 2499, supplier: 'CDW',
    warrantyExpiry: Date.now() + 15768000000, 
    assignedTo: 'user1', assignmentDate: Date.now() - 31536000000,
    location: 'Building A, Floor 3', ipAddress: '192.168.1.105', macAddress: '00:1A:2B:3C:4D:5E',
    specs: { "CPU": "Intel Core i9", "RAM": "32GB", "OS": "Windows 11", "Storage": "1TB SSD" }
  },
  {
    id: 'A-102', // Child of A-101
    assetCode: 'AST-2023-002',
    brandId: 'B-DELL', modelId: 'M-DELL-MON', departmentId: 'D-DES',
    categoryId: 'CAT-MON', subcategoryId: 'SUB-MON-LED',
    name: "Alice's Monitor", serialNumber: "MNTR-445566",
    type: AssetType.PERIPHERAL, status: AssetStatus.IN_USE, condition: AssetCondition.EXCELLENT,
    purchaseDate: Date.now() - 15768000000, purchaseCost: 650, supplier: 'Dell Direct',
    warrantyExpiry: Date.now() + 47304000000,
    assignedTo: 'user1', parentId: 'A-101',
    location: 'Building A, Floor 3',
    specs: { "Size": "27 inch", "Resolution": "4K" }
  },
  {
    id: 'A-103',
    assetCode: 'AST-2024-055',
    brandId: 'B-ADOBE', modelId: 'M-ADOBE-CC', departmentId: 'D-DES',
    categoryId: 'CAT-SOFT', subcategoryId: 'SUB-SOFT-SUB',
    name: "Alice's Creative Cloud", serialNumber: "LIC-Adobe-2024",
    type: AssetType.SOFTWARE, status: AssetStatus.IN_USE, condition: AssetCondition.NEW,
    purchaseDate: Date.now() - 5000000000, purchaseCost: 899, supplier: 'Adobe',
    warrantyExpiry: Date.now() + 10000000000, 
    assignedTo: 'user1',
    specs: { "License": "Enterprise", "Seats": "1" }
  },
  {
    id: 'A-201', // Server
    assetCode: 'AST-SRV-001',
    brandId: 'B-HP', modelId: 'M-HP-SERVER', departmentId: 'D-IT',
    categoryId: 'CAT-SERV', subcategoryId: 'SUB-SERV-RACK',
    name: "Main App Server", serialNumber: "SRV-001",
    type: AssetType.SERVER, status: AssetStatus.IN_USE, condition: AssetCondition.GOOD,
    purchaseDate: Date.now() - 63072000000, purchaseCost: 5500, supplier: 'HPE',
    warrantyExpiry: Date.now() - 1000000, // Expired
    location: 'Data Center 1', ipAddress: '10.0.0.5',
    specs: { "Role": "Application Server", "CPU": "Xeon Gold", "RAM": "64GB ECC", "Storage": "RAID 5 12TB" },
    lastMaintenanceDate: Date.now() - 2592000000
  }
];

let feedbackStore: Feedback[] = [];
let assetReportStore: AssetReport[] = [];

// --- User Management & Auth Logic ---
export const registerUser = (user: User) => {
    // Check if email exists
    const existing = Object.values(USERS).find(u => u.email === user.email);
    if (existing) throw new Error("Email already registered");
    
    USERS[user.id] = {...user, status: 'ACTIVE'};
    logAdminAction('system', 'USER_REGISTER', user.id, `New user registration: ${user.email}`, 'INFO');
    return user;
};

export const findUserByEmail = (email: string) => {
    return Object.values(USERS).find(u => u.email === email);
};

// --- Ticket Stores ---
export const getTickets = () => {
    // Recalculate SLA status on fetch to keep badges updated
    return tickets.map(t => ({...t, slaStatus: getSLAStatus(t) }));
};

export const getTicketById = (id: string) => tickets.find(t => t.id === id);

export const addTicket = (ticket: Ticket) => { 
    // Calculate SLA
    const sla = calculateSLADeadline(ticket.priority, ticket.createdAt);
    const enrichedTicket = {
        ...ticket,
        slaTarget: sla.target,
        slaTier: sla.tier,
        demandFactorApplied: sla.demandFactor,
        slaStatus: 'ON_TRACK' as const
    };

    tickets = [enrichedTicket, ...tickets]; 
    return enrichedTicket; 
};

export const updateTicketStatus = (id: string, status: TicketStatus) => { tickets = tickets.map(t => t.id === id ? { ...t, status, updatedAt: Date.now() } : t); };
export const addMessageToTicket = (ticketId: string, message: Message) => {
  tickets = tickets.map(t => { if (t.id === ticketId) { return { ...t, messages: [...t.messages, message], updatedAt: Date.now(), status: message.senderId.startsWith('agent') ? TicketStatus.AWAITING_CUSTOMER : TicketStatus.IN_PROGRESS }; } return t; });
};
export const updateTicketAnalysis = (id: string, analysis: Partial<Ticket['aiAnalysis']>) => { tickets = tickets.map(t => t.id === id ? { ...t, aiAnalysis: { ...t.aiAnalysis, ...analysis } } : t); }
export const updateTicketAssignee = (ticketId: string, agentId: string) => { tickets = tickets.map(t => t.id === ticketId ? { ...t, assignedAgentId: agentId } : t); }
export const linkAssetToTicket = (ticketId: string, assetId: string | undefined) => { tickets = tickets.map(t => t.id === ticketId ? { ...t, linkedAssetId: assetId } : t); }

// --- Feedback Methods ---
export const submitFeedback = (feedback: Feedback) => {
    feedbackStore.push(feedback);
    // Link to ticket and close it
    tickets = tickets.map(t => t.id === feedback.ticketId ? { ...t, feedbackId: feedback.id, status: TicketStatus.CLOSED } : t);
    return feedback;
};

export const getTicketFeedback = (ticketId: string) => feedbackStore.find(f => f.ticketId === ticketId);

// --- Asset Reporting Methods ---
export const addAssetReport = (report: AssetReport) => {
    assetReportStore = [report, ...assetReportStore];
    return report;
}
export const getAssetReports = (assetId: string) => assetReportStore.filter(r => r.assetId === assetId);


// Asset Methods
export const getAssets = () => [...assets];
export const getAssetById = (id: string) => assets.find(a => a.id === id);
export const addAsset = (asset: Asset) => { assets = [asset, ...assets]; return asset; };
export const getUserAssets = (userId: string) => assets.filter(a => a.assignedTo === userId);
export const getTicketsForAsset = (assetId: string) => tickets.filter(t => t.linkedAssetId === assetId);

// Registry Accessors
export const getBrands = () => [...BRANDS];
export const getModels = () => [...MODELS];
export const getDepartments = () => [...DEPARTMENTS];
export const getAssetCategories = () => [...ASSET_CATEGORIES];
export const getAssetSubcategories = () => [...ASSET_SUBCATEGORIES];

// Helper to resolve relationships
export const getAssetWithDetails = (asset: Asset) => {
    const brand = BRANDS.find(b => b.id === asset.brandId);
    const model = MODELS.find(m => m.id === asset.modelId);
    const dept = DEPARTMENTS.find(d => d.id === asset.departmentId);
    const cat = ASSET_CATEGORIES.find(c => c.id === asset.categoryId);
    const sub = ASSET_SUBCATEGORIES.find(s => s.id === asset.subcategoryId);
    const assignee = asset.assignedTo ? USERS[asset.assignedTo] : null;

    return { 
        ...asset, 
        brandName: brand?.name, 
        modelName: model?.name, 
        modelImage: model?.imageUrl, 
        departmentName: dept?.name,
        categoryName: cat?.name,
        categoryIcon: cat?.icon,
        subcategoryName: sub?.name,
        assigneeName: assignee?.name
    };
};

// Hierarchy Helper
export const getAssetHierarchy = (assetId: string) => {
    const children = assets.filter(a => a.parentId === assetId);
    return children;
}

// Assignment Logic
export const getAgents = () => Object.values(USERS).filter(u => u.role === 'AGENT' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
export const calculateBestAgent = (ticket: Ticket): AgentScore[] => {
    const agents = getAgents();
    const asset = ticket.linkedAssetId ? getAssetById(ticket.linkedAssetId) : null;
    const modelName = asset ? MODELS.find(m => m.id === asset.modelId)?.name : null;

    const scores = agents.map(agent => {
        const hasSkill = agent.skills?.includes(ticket.category);
        const skillScore = hasSkill ? 40 : 5; 
        const efficiency = (agent.efficiencyRating || 50) / 100;
        const historyScore = efficiency * 25;
        const active = agent.activeTicketCount || 0;
        const workloadFactor = Math.max(0, (10 - active) / 10);
        const workloadScore = workloadFactor * 20;
        let assetScore = 0;
        if (modelName && agent.assetFamiliarityScore?.[modelName]) {
            assetScore = (agent.assetFamiliarityScore[modelName] / 100) * 15;
        }
        const total = Math.round(skillScore + historyScore + workloadScore + assetScore);

        return {
            agent,
            totalScore: total,
            breakdown: { skillMatch: skillScore, history: historyScore, workload: workloadScore, assetFamiliarity: assetScore }
        };
    });
    return scores.sort((a, b) => b.totalScore - a.totalScore);
};

export const getDynamicFieldsForCategory = (category: Category): { id: string; label: string; type: string; placeholder?: string; options?: string[] }[] => {
    switch (category) {
        case Category.TECHNICAL:
            return [
                { id: 'error_code', label: 'Error Message/Code', type: 'text', placeholder: 'e.g., Error 503' },
                { id: 'steps_reproduce', label: 'Steps to Reproduce', type: 'textarea', placeholder: '1. Click login...' },
                { id: 'impact', label: 'Business Impact', type: 'select', options: ['Blocking me only', 'Blocking my team', 'Blocking entire company'] }
            ];
        case Category.FINANCE:
            return [
                { id: 'invoice_no', label: 'Invoice Number', type: 'text', placeholder: 'INV-2024-...' },
                { id: 'amount', label: 'Disputed Amount', type: 'number', placeholder: '0.00' },
                { id: 'date', label: 'Transaction Date', type: 'date' }
            ];
        case Category.SALES:
             return [
                { id: 'crm_link', label: 'CRM Opportunity Link', type: 'text' },
                { id: 'customer_name', label: 'Client Name', type: 'text' }
            ];
        default:
            return [];
    }
}

// --- Admin & Security Logic ---

export const logAdminAction = (actorId: string, action: string, targetId: string | undefined, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const log: AuditLog = {
        id: `log-${Date.now()}`,
        actorId,
        actorName: actorId === 'system' ? 'System' : USERS[actorId]?.name || 'Unknown',
        action,
        targetId,
        details,
        timestamp: Date.now(),
        severity,
        ipAddress: '192.168.1.100' // Mock IP
    };
    auditLogs = [log, ...auditLogs];
    return log;
};

export const getAuditLogs = () => [...auditLogs];

export const getSystemConfig = () => ({...systemConfig});

export const updateSystemConfig = (actorId: string, updates: Partial<SystemConfig>) => {
    const oldConfig = {...systemConfig};
    systemConfig = { ...systemConfig, ...updates };
    
    // Log changes
    const changes = Object.keys(updates).map(k => `${k}: ${oldConfig[k as keyof SystemConfig]} -> ${updates[k as keyof SystemConfig]}`).join(', ');
    logAdminAction(actorId, 'CONFIG_CHANGE', undefined, `Updated system config: ${changes}`, 'WARNING');
    
    return systemConfig;
};

export const getAllUsers = () => Object.values(USERS);

export const toggleUserStatus = (actorId: string, userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    if (USERS[userId]) {
        USERS[userId] = { ...USERS[userId], status };
        logAdminAction(actorId, status === 'SUSPENDED' ? 'USER_SUSPEND' : 'USER_ACTIVATE', userId, `User ${USERS[userId].email} status changed to ${status}`, 'CRITICAL');
    }
}

export const adminResetPassword = (actorId: string, userId: string) => {
    if (USERS[userId]) {
        // Mock password reset
        USERS[userId] = { ...USERS[userId], password: 'password123' };
        logAdminAction(actorId, 'FORCE_PASS_RESET', userId, `Force password reset for ${USERS[userId].email}`, 'WARNING');
    }
}

export const getSystemHealth = (): SystemHealth => {
    // Mock health metrics
    return {
        status: systemConfig.lockdownMode ? 'CRITICAL' : systemConfig.maintenanceMode ? 'DEGRADED' : 'HEALTHY',
        uptime: 1402394, // seconds
        activeUsers: Object.values(USERS).filter(u => u.status === 'ACTIVE').length,
        databaseLatency: Math.floor(Math.random() * 20) + 5,
        pendingJobs: tickets.filter(t => t.status === TicketStatus.OPEN).length
    };
}

// --- Escalation Rule Logic ---

export const getEscalationRules = () => [...escalationRules];

export const addEscalationRule = (rule: Omit<EscalationRule, 'id'>) => {
    const newRule = { ...rule, id: `rule-${Date.now()}` };
    escalationRules = [...escalationRules, newRule];
    return newRule;
};

export const deleteEscalationRule = (id: string) => {
    escalationRules = escalationRules.filter(r => r.id !== id);
};

export const runEscalationJob = (actorId: string): number => {
    let escalationCount = 0;
    const now = Date.now();

    tickets = tickets.map(ticket => {
        if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) return ticket;
        if (ticket.isEscalated) return ticket; // Already escalated, skip (for simplicity of demo)

        // Calculate fresh SLA status
        const slaStatus = getSLAStatus(ticket);
        
        // Find first matching rule
        const rule = escalationRules.find(r => {
            if (!r.isActive) return false;
            
            // Matches Priority?
            if (r.condition.priority && r.condition.priority !== ticket.priority) return false;
            
            // Matches Category?
            if (r.condition.category && r.condition.category !== ticket.category) return false;

            // Matches SLA?
            if (r.condition.slaStatus && r.condition.slaStatus !== slaStatus) return false;

            return true;
        });

        if (rule) {
            escalationCount++;
            
            // Create Audit Log
            logAdminAction('system', 'AUTO_ESCALATION', ticket.id, `Escalated via Rule: ${rule.name}`, 'WARNING');

            // Add Internal Note Message
            const sysMessage: Message = {
                id: `m-esc-${Date.now()}`,
                ticketId: ticket.id,
                senderId: 'system',
                senderName: 'System Escalation Bot',
                content: `⚡ TICKET ESCALATED ⚡\nReason: ${rule.action.note}\nAction: ${rule.action.assignToUserId ? `Reassigned to ${USERS[rule.action.assignToUserId]?.name}` : 'No reassignment'}.`,
                timestamp: now,
                isInternal: true
            };

            return {
                ...ticket,
                isEscalated: true,
                assignedAgentId: rule.action.assignToUserId || ticket.assignedAgentId,
                priority: rule.action.newPriority || ticket.priority,
                messages: [...ticket.messages, sysMessage],
                updatedAt: now
            };
        }

        return ticket;
    });

    if (escalationCount > 0) {
        logAdminAction(actorId, 'RUN_ESCALATION_JOB', undefined, `Ran escalation job. Escalated ${escalationCount} tickets.`, 'INFO');
    }

    return escalationCount;
};

// --- New Dashboard Aggregation Logic ---

export const getAssetStats = () => {
    const allAssets = getAssets();
    
    // Total Value
    const totalValue = allAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
    
    // Status Counts
    const statusCounts = allAssets.reduce((acc: any, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {});

    // Category Counts
    const categoryCounts = allAssets.reduce((acc: any, a) => {
        const catName = ASSET_CATEGORIES.find(c => c.id === a.categoryId)?.name || 'Unknown';
        acc[catName] = (acc[catName] || 0) + 1;
        return acc;
    }, {});

    // Expiring Warranties (next 90 days)
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const expiringCount = allAssets.filter(a => a.warrantyExpiry > now && a.warrantyExpiry < (now + ninetyDays)).length;

    // Maintenance Queue
    const maintenanceCount = allAssets.filter(a => a.status === AssetStatus.MAINTENANCE).length;

    return {
        totalAssets: allAssets.length,
        totalValue,
        statusCounts,
        categoryCounts,
        expiringCount,
        maintenanceCount,
        assignedCount: allAssets.filter(a => a.status === AssetStatus.IN_USE).length
    };
};

export const getRecentAssetActivity = () => {
    return [
        { id: 1, action: 'Asset Assigned', details: 'MacBook Air M2 assigned to John Doe', time: '2 hours ago', icon: 'user-check' },
        { id: 2, action: 'Maintenance Completed', details: 'Server patch update applied (SRV-001)', time: '5 hours ago', icon: 'check-circle' },
        { id: 3, action: 'New Asset', details: 'Added Dell XPS 15 to inventory', time: '1 day ago', icon: 'plus' },
        { id: 4, action: 'Warranty Alert', details: 'License expiring for Adobe CC', time: '2 days ago', icon: 'alert-triangle' }
    ];
};
