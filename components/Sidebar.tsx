import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppPermission } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { user, logout, hasPermission } = useAuth();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">HM</div>
        <span className="text-xl font-bold tracking-tight">HelpMind</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-8">
        {/* Menu Items */}
        <nav className="space-y-2">
          
          {/* Customer / Universal Links */}
          {hasPermission(AppPermission.CREATE_TICKET) && (
             <button
                onClick={() => setActiveView('portal')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'portal' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>New Ticket</span>
              </button>
          )}

          {hasPermission(AppPermission.VIEW_OWN_TICKETS) && (
              <button
                onClick={() => setActiveView('my-tickets')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'my-tickets' || (activeView.startsWith('ticket-') && !hasPermission(AppPermission.VIEW_ALL_TICKETS)) ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span>My Tickets</span>
              </button>
          )}

          <div className="border-t border-slate-800 my-4"></div>

          {/* Agent / Admin Links */}
          {hasPermission(AppPermission.MANAGE_SYSTEM) && (
             <button
                onClick={() => setActiveView('admin-console')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors mb-4 border border-red-900/50 ${activeView === 'admin-console' ? 'bg-red-900/20 text-red-400' : 'text-red-400 hover:bg-red-900/10'}`}
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>Admin Console</span>
             </button>
          )}

          {hasPermission(AppPermission.VIEW_ALL_TICKETS) && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'dashboard' || (activeView.startsWith('ticket-') && hasPermission(AppPermission.VIEW_ALL_TICKETS)) ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              <span>Ticket Queue</span>
            </button>
          )}

          {hasPermission(AppPermission.VIEW_ALL_ASSETS) && (
            <button
              onClick={() => setActiveView('assets')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'assets' || activeView.startsWith('asset-') ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
              <span>Assets & Inventory</span>
            </button>
          )}

          {hasPermission(AppPermission.VIEW_ANALYTICS) && (
            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'analytics' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span>Analytics & Insights</span>
            </button>
          )}

        </nav>
      </div>

      <div className="p-4 bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || "https://picsum.photos/id/64/100/100"}
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-indigo-500"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate w-24">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};