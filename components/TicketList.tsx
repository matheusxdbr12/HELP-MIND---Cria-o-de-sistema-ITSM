import React from 'react';
import { Ticket, TicketStatus, Priority, AppPermission } from '../types';
import { formatTimeRemaining } from '../services/slaService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (id: string) => void;
  role: 'CUSTOMER' | 'AGENT';
}

const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.OPEN: return 'bg-blue-100 text-blue-700';
    case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-700';
    case TicketStatus.AWAITING_CUSTOMER: return 'bg-purple-100 text-purple-700';
    case TicketStatus.RESOLVED: return 'bg-green-100 text-green-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'text-red-600 font-bold';
      case Priority.HIGH: return 'text-orange-600 font-semibold';
      case Priority.MEDIUM: return 'text-blue-600';
      default: return 'text-slate-500';
    }
};

export const TicketList: React.FC<TicketListProps> = ({ tickets, onSelectTicket }) => {
  const { hasPermission } = useAuth();
  const { t } = useLanguage();
  const showSLA = hasPermission(AppPermission.VIEW_ALL_TICKETS) || hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS);

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('id')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('subject')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('category')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('priority')}</th>
              {showSLA && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('slaTarget')}</th>}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('created')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => onSelectTicket(ticket.id)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-mono text-slate-500 group-hover:text-indigo-600">#{ticket.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{ticket.title}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{ticket.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                
                {showSLA && (
                    <td className="px-6 py-4">
                        {ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED ? (
                             <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                                 ticket.slaStatus === 'BREACHED' ? 'bg-red-100 text-red-700' :
                                 ticket.slaStatus === 'AT_RISK' ? 'bg-orange-100 text-orange-700' :
                                 'bg-green-100 text-green-700'
                             }`}>
                                 {ticket.slaStatus === 'BREACHED' ? '⚠️ ' : ''}
                                 {formatTimeRemaining(ticket.slaTarget)}
                             </div>
                        ) : (
                            <span className="text-slate-400 text-xs">-</span>
                        )}
                    </td>
                )}

                <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
                <tr>
                    <td colSpan={showSLA ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                        {t('noTicketsFound')}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};