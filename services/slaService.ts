import { Priority, Ticket, TicketStatus } from "../types";

// Base SLA Hours by Priority
const BASE_SLA_HOURS = {
    [Priority.CRITICAL]: 4,
    [Priority.HIGH]: 8,
    [Priority.MEDIUM]: 24,
    [Priority.LOW]: 72
};

export const getBaseSLA = (priority: Priority) => BASE_SLA_HOURS[priority];

// Simulate dynamic demand factor (0.8 to 1.5)
// In a real app, this would query active ticket count vs agent capacity
export const getCurrentDemandFactor = (): number => {
    // Determine factor based on random mock for demo purposes
    // 0.8 = Low demand (faster SLA), 1.0 = Normal, 1.5 = High Demand (slower SLA)
    const hour = new Date().getHours();
    
    // Peak hours 9am - 5pm
    if (hour >= 9 && hour <= 17) return 1.2;
    // Off hours
    if (hour < 8 || hour > 19) return 0.8;
    
    return 1.0;
};

export const calculateSLADeadline = (priority: Priority, startTime: number): { target: number, demandFactor: number, tier: Ticket['slaTier'] } => {
    const baseHours = BASE_SLA_HOURS[priority];
    const demandFactor = getCurrentDemandFactor();
    
    // Dynamic Adjustment: AdjustedHours = Base * DemandFactor
    const adjustedHours = baseHours * demandFactor;
    
    const target = startTime + (adjustedHours * 60 * 60 * 1000);

    let tier: Ticket['slaTier'] = 'Standard';
    if (priority === Priority.CRITICAL) tier = 'Platinum';
    else if (priority === Priority.HIGH) tier = 'Gold';
    else if (priority === Priority.MEDIUM) tier = 'Silver';
    else tier = 'Bronze';

    return {
        target,
        demandFactor,
        tier
    };
};

export const getSLAStatus = (ticket: Ticket): 'ON_TRACK' | 'AT_RISK' | 'BREACHED' => {
    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) return 'ON_TRACK';

    const now = Date.now();
    const timeLeft = ticket.slaTarget - now;
    const totalDuration = ticket.slaTarget - ticket.createdAt;

    if (timeLeft < 0) return 'BREACHED';
    
    // If less than 20% of time remains, it's At Risk
    if ((timeLeft / totalDuration) < 0.20) return 'AT_RISK';

    return 'ON_TRACK';
};

export const formatTimeRemaining = (target: number): string => {
    const now = Date.now();
    const diff = target - now;
    
    if (diff < 0) {
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `-${hours}h ${mins}m`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
};