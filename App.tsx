import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { AssetForm } from './components/AssetForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getTickets, getTicketById, getAssets, getAssetById } from './services/mockStore';
import { Ticket, Asset } from './types';

// Main Application Layout
const AppLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('portal');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  // Auth Flow State
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const refreshData = () => {
    setTickets(getTickets());
    setAssets(getAssets());
  };

  useEffect(() => {
    if (isAuthenticated) {
        refreshData();
        // Reset view based on role if just logged in
        if (activeView === 'portal' && user?.role === 'AGENT') setActiveView('dashboard');
        if (activeView === 'portal' && user?.role === 'SUPER_ADMIN') setActiveView('admin-console');
        if (activeView === 'dashboard' && user?.role === 'CUSTOMER') setActiveView('portal');
    }
  }, [isAuthenticated, user, activeView]);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  if (!isAuthenticated) {
      if (authView === 'REGISTER') {
          return <Register onSwitchToLogin={() => setAuthView('LOGIN')} />;
      }
      return <Login onSwitchToRegister={() => setAuthView('REGISTER')} />;
  }

  const handleTicketCreated = () => {
    refreshData();
    setActiveView('my-tickets');
  };

  const handleAssetCreated = () => {
      refreshData();
      setActiveView('assets');
  }

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveView(`ticket-${id}`);
  };

  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setActiveView(`asset-${id}`);
  };

  const renderContent = () => {
    if (activeView.startsWith('ticket-') && selectedTicketId) {
      const ticket = getTicketById(selectedTicketId);
      if (ticket) {
        return (
          <TicketDetail 
            ticket={ticket} 
            currentUser={user!} 
            onBack={() => setActiveView(user?.role === 'CUSTOMER' ? 'my-tickets' : 'dashboard')}
            onUpdate={refreshData}
          />
        );
      }
    }

    if (activeView.startsWith('asset-') && selectedAssetId) {
      const asset = getAssetById(selectedAssetId);
      if (asset) {
        return (
           <AssetDetail 
             asset={asset}
             onBack={() => setActiveView('assets')}
             onSelectTicket={handleSelectTicket}
           />
        );
      }
    }

    if (activeView === 'assets-new') {
        return <AssetForm onAssetCreated={handleAssetCreated} onCancel={() => setActiveView('assets')} />;
    }

    switch (activeView) {
      case 'portal':
        return <TicketForm onTicketCreated={handleTicketCreated} currentUser={user} />;
      case 'my-tickets':
        const myTickets = tickets.filter(t => t.customerId === user?.id);
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">My Support Requests</h2>
            <TicketList tickets={myTickets} onSelectTicket={handleSelectTicket} role="CUSTOMER" />
          </div>
        );
      case 'dashboard':
        return (
           <div className="max-w-6xl mx-auto h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Agent Queue</h2>
                <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                        {tickets.filter(t => t.status !== 'CLOSED').length} Open
                    </span>
                     <span className="px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-sm font-medium text-red-600">
                        {tickets.filter(t => t.priority === 'Critical').length} Critical
                    </span>
                </div>
            </div>
            <TicketList tickets={tickets} onSelectTicket={handleSelectTicket} role="AGENT" />
          </div>
        );
      case 'assets':
          return (
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">IT Assets Inventory</h2>
                        <span className="text-sm text-slate-500">Manage hardware, software, and organization allocations.</span>
                    </div>
                    {user?.role === 'AGENT' && (
                        <button 
                            onClick={() => setActiveView('assets-new')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Register Asset
                        </button>
                    )}
                </div>
                <AssetList assets={assets} onSelectAsset={handleSelectAsset} />
            </div>
          );
      case 'analytics':
          return <AnalyticsDashboard />;
      case 'admin-console':
          return user?.role === 'SUPER_ADMIN' ? <AdminDashboard /> : <div>Unauthorized</div>;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <main className="pl-64 transition-all duration-300">
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {activeView.replace('-', ' ')}
          </h1>
          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </button>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Root Component wrapping Context
const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppLayout />
        </AuthProvider>
    );
}

export default App;