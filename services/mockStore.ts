import { Ticket, User, TicketStatus, Priority, Category, Sentiment, Message, Asset, AssetType, AssetStatus, AgentScore, Brand, Model, Department, AssetCondition } from "../types";

// --- Registries ---

export const BRANDS: Brand[] = [
  { id: 'B-DELL', name: 'Dell', website: 'dell.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { id: 'B-APPLE', name: 'Apple', website: 'apple.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'B-ADOBE', name: 'Adobe', website: 'adobe.com' },
  { id: 'B-HP', name: 'HP', website: 'hp.com' }
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

export const USERS: Record<string, User> = {
  'user1': { 
    id: 'user1', name: 'Alice Customer', role: 'CUSTOMER', avatar: 'https://picsum.photos/id/64/100/100', departmentId: 'D-DES'
  },
  'agent1': { 
    id: 'agent1', name: 'Bob Agent (Tech)', role: 'AGENT', avatar: 'https://picsum.photos/id/1005/100/100', departmentId: 'D-IT',
    skills: [Category.TECHNICAL, Category.GENERAL],
    efficiencyRating: 88,
    activeTicketCount: 3,
    assetFamiliarityScore: { 'XPS 15 9530': 95 }
  },
  'agent2': { 
    id: 'agent2', name: 'Sarah Finance', role: 'AGENT', avatar: 'https://picsum.photos/id/1011/100/100', departmentId: 'D-FIN',
    skills: [Category.FINANCE, Category.SALES],
    efficiencyRating: 92,
    activeTicketCount: 1,
    assetFamiliarityScore: {}
  }
};

// --- Mock Assets (Hierarchical) ---

let assets: Asset[] = [
  {
    id: 'A-101',
    brandId: 'B-DELL', modelId: 'M-XPS15', departmentId: 'D-DES',
    name: "Alice's Workstation", serialNumber: "DXPS-998877",
    type: AssetType.HARDWARE, status: AssetStatus.IN_USE, condition: AssetCondition.GOOD,
    purchaseDate: Date.now() - 31536000000, purchaseCost: 2499, supplier: 'CDW',
    warrantyExpiry: Date.now() + 15768000000, 
    assignedTo: 'user1',
    specs: { "CPU": "Intel Core i9", "RAM": "32GB", "OS": "Windows 11" }
  },
  {
    id: 'A-102', // Child of A-101
    brandId: 'B-DELL', modelId: 'M-DELL-MON', departmentId: 'D-DES',
    name: "Alice's Monitor", serialNumber: "MNTR-445566",
    type: AssetType.PERIPHERAL, status: AssetStatus.IN_USE, condition: AssetCondition.EXCELLENT,
    purchaseDate: Date.now() - 15768000000, purchaseCost: 650, supplier: 'Dell Direct',
    warrantyExpiry: Date.now() + 47304000000,
    assignedTo: 'user1', parentId: 'A-101'
  },
  {
    id: 'A-103',
    brandId: 'B-ADOBE', modelId: 'M-ADOBE-CC', departmentId: 'D-DES',
    name: "Alice's Creative Cloud", serialNumber: "LIC-Adobe-2024",
    type: AssetType.SOFTWARE, status: AssetStatus.IN_USE, condition: AssetCondition.NEW,
    purchaseDate: Date.now() - 5000000000, purchaseCost: 899, supplier: 'Adobe',
    warrantyExpiry: Date.now() + 10000000000, 
    assignedTo: 'user1'
  },
  {
    id: 'A-201', // Server
    brandId: 'B-HP', modelId: 'M-HP-SERVER', departmentId: 'D-IT',
    name: "Main App Server", serialNumber: "SRV-001",
    type: AssetType.SERVER, status: AssetStatus.IN_USE, condition: AssetCondition.GOOD,
    purchaseDate: Date.now() - 63072000000, purchaseCost: 5500, supplier: 'HPE',
    warrantyExpiry: Date.now() - 1000000, // Expired
    specs: { "Role": "Application Server", "IP": "10.0.0.5" }
  }
];

// --- Mock Initial Tickets ---
let tickets: Ticket[] = [
  {
    id: 'T-1001',
    title: 'Login failing on mobile app',
    description: 'I cannot log in to the IOS app after the latest update.',
    category: Category.TECHNICAL,
    priority: Priority.HIGH,
    status: TicketStatus.OPEN,
    sentiment: Sentiment.FRUSTRATED,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86000000,
    customerId: 'user1',
    messages: [
      { id: 'm1', ticketId: 'T-1001', senderId: 'user1', senderName: 'Alice Customer', content: 'I cannot log in to the IOS app after the latest update.', timestamp: Date.now() - 86400000, isInternal: false }
    ]
  }
];

// --- Stores ---
export const getTickets = () => [...tickets];
export const getTicketById = (id: string) => tickets.find(t => t.id === id);
export const addTicket = (ticket: Ticket) => { tickets = [ticket, ...tickets]; return ticket; };
export const updateTicketStatus = (id: string, status: TicketStatus) => { tickets = tickets.map(t => t.id === id ? { ...t, status, updatedAt: Date.now() } : t); };
export const addMessageToTicket = (ticketId: string, message: Message) => {
  tickets = tickets.map(t => { if (t.id === ticketId) { return { ...t, messages: [...t.messages, message], updatedAt: Date.now(), status: message.senderId.startsWith('agent') ? TicketStatus.AWAITING_CUSTOMER : TicketStatus.IN_PROGRESS }; } return t; });
};
export const updateTicketAnalysis = (id: string, analysis: Partial<Ticket['aiAnalysis']>) => { tickets = tickets.map(t => t.id === id ? { ...t, aiAnalysis: { ...t.aiAnalysis, ...analysis } } : t); }
export const updateTicketAssignee = (ticketId: string, agentId: string) => { tickets = tickets.map(t => t.id === ticketId ? { ...t, assignedAgentId: agentId } : t); }
export const linkAssetToTicket = (ticketId: string, assetId: string | undefined) => { tickets = tickets.map(t => t.id === ticketId ? { ...t, linkedAssetId: assetId } : t); }

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

// Helper to resolve relationships
export const getAssetWithDetails = (asset: Asset) => {
    const brand = BRANDS.find(b => b.id === asset.brandId);
    const model = MODELS.find(m => m.id === asset.modelId);
    const dept = DEPARTMENTS.find(d => d.id === asset.departmentId);
    return { ...asset, brandName: brand?.name, modelName: model?.name, modelImage: model?.imageUrl, departmentName: dept?.name };
};

// Hierarchy Helper
export const getAssetHierarchy = (assetId: string) => {
    const children = assets.filter(a => a.parentId === assetId);
    return children;
}

// Assignment Logic
export const getAgents = () => Object.values(USERS).filter(u => u.role === 'AGENT');
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
