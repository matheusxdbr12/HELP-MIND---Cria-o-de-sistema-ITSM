import React from 'react';
import { TicketList } from './TicketList';
import { Ticket, TicketStatus, Priority } from '../types';
import { getCurrentDemandFactor } from '../services/slaService';
import { useLanguage } from '../context/LanguageContext';

interface AgentDashboardProps {
  tickets: Ticket[];
  onSelectTicket: (id: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ tickets, onSelectTicket }) => {
  const demandFactor = getCurrentDemandFactor();
  const { t } = useLanguage();
  
  const openTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED);
  const criticalTickets = tickets.filter(t => t.priority === Priority.CRITICAL && t.status !== TicketStatus.CLOSED);
  const breachedTickets = tickets.filter(t => t.slaStatus === 'BREACHED' && t.status !== TicketStatus.CLOSED);
  const atRiskTickets = tickets.filter(t => t.slaStatus === 'AT_RISK' && t.status !== TicketStatus.CLOSED);

  const getSLAHealthColor = () => {
      const breachRate = breachedTickets.length / (openTickets.length || 1);
      if (breachRate > 0.1) return 'bg-red-500';
      if (breachRate > 0.05) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
          <div>
              <h2 className="text-3xl font-bold text-slate-900">{t('agentCommandCenter')}</h2>
              <p className="text-slate-500">{t('queueMonitoring')}</p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-xs uppercase font-bold text-slate-500">{t('currentDemand')}</span>
              <div className="h-4 w-px bg-slate-300 mx-2"></div>
              <span className={`text-sm font-bold ${demandFactor > 1.2 ? 'text-red-600' : demandFactor < 1 ? 'text-green-600' : 'text-blue-600'}`}>
                  {demandFactor > 1.2 ? 'High Load' : demandFactor < 1 ? 'Low Load' : 'Normal'} (x{demandFactor})
              </span>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{t('myQueue')}</span>
                      <div className="text-3xl font-bold text-slate-800 mt-1">{openTickets.length}</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{t('critical')}</span>
                      <div className="text-3xl font-bold text-red-600 mt-1">{criticalTickets.length}</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg animate-pulse">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{t('slaBreached')}</span>
                      <div className="text-3xl font-bold text-slate-800 mt-1">{breachedTickets.length}</div>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
              </div>
               <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
                   <span className="mr-1">{atRiskTickets.length}</span> {t('ticketsAtRisk')}
               </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{t('slaHealth')}</span>
                      <div className="text-3xl font-bold text-slate-800 mt-1">94%</div>
                  </div>
                  <div className={`p-2 rounded-lg ${getSLAHealthColor()} bg-opacity-20`}>
                      <div className={`w-5 h-5 rounded-full ${getSLAHealthColor()}`}></div>
                  </div>
              </div>
              <div className="mt-4 text-xs text-slate-400">Target: >95%</div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{t('activeTicketQueue')}</h3>
              <div className="flex space-x-2">
                  <select className="text-sm border-slate-300 rounded-lg focus:ring-indigo-500">
                      <option>{t('allPriorities')}</option>
                      <option>{t('critical')}</option>
                      <option>High</option>
                  </select>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto">
              <TicketList tickets={tickets} onSelectTicket={onSelectTicket} role="AGENT" />
          </div>
      </div>
    </div>
  );
};