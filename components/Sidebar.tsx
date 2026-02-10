import React from 'react';

interface SidebarProps {
  currentRole: 'CUSTOMER' | 'AGENT';
  setRole: (role: 'CUSTOMER' | 'AGENT') => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, setRole, activeView, setActiveView }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">HM</div>
        <span className="text-xl font-bold tracking-tight">HelpMind</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-8">
        {/* Role Switcher (For Demo Purposes) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Current Persona
          </label>
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => { setRole('CUSTOMER'); setActiveView('portal'); }}
              className={`flex-1 py-1 text-sm rounded-md transition-colors ${currentRole === 'CUSTOMER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Customer
            </button>
            <button
              onClick={() => { setRole('AGENT'); setActiveView('dashboard'); }}
              className={`flex-1 py-1 text-sm rounded-md transition-colors ${currentRole === 'AGENT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {currentRole === 'CUSTOMER' ? (
            <>
               <button
                onClick={() => setActiveView('portal')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'portal' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>New Ticket</span>
              </button>
              <button
                onClick={() => setActiveView('my-tickets')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'my-tickets' || activeView.startsWith('ticket-') ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span>My Tickets</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'dashboard' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span>Ticket Queue</span>
              </button>
              <button
                onClick={() => setActiveView('assets')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'assets' || activeView.startsWith('asset-') ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                <span>Assets & Inventory</span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${activeView === 'analytics' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span>Analytics & Insights</span>
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="p-4 bg-slate-950">
        <div className="flex items-center space-x-3">
          <img
            src={currentRole === 'CUSTOMER' ? "https://picsum.photos/id/64/100/100" : "https://picsum.photos/id/1005/100/100"}
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-indigo-500"
          />
          <div>
            <p className="text-sm font-medium text-white">{currentRole === 'CUSTOMER' ? 'Alice Customer' : 'Bob Agent'}</p>
            <p className="text-xs text-slate-400">{currentRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
