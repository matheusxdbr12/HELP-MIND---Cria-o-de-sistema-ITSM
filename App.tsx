import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { AssetForm } from './components/AssetForm';
import { AssetDashboard } from './components/AssetDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AgentDashboard } from './components/AgentDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { getTickets, getTicketById, getAssets, getAssetById } from './services/mockStore';
import { Ticket, Asset, AppPermission, Category, User } from './types';

// Main Application Layout
const AppLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
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

  // Helper to determine if a ticket is visible to the current user
  const checkTicketAccess = useCallback((ticket: Ticket, currentUser: User | null) => {
      if (!currentUser) return false;
      if (hasPermission(AppPermission.VIEW_ALL_TICKETS)) return true;
      if (ticket.customerId === currentUser.id) return true; // Can always see own tickets

      if (hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS)) {
          // 1. Directly Assigned
          if (ticket.assignedAgentId === currentUser.id) return true;
          
          // 2. Department Match (Mock Logic)
          // IT Dept sees Technical & General
          if (currentUser.departmentId === 'D-IT' && (ticket.category === Category.TECHNICAL || ticket.category === Category.GENERAL)) return true;
          // Finance Dept sees Finance
          if (currentUser.departmentId === 'D-FIN' && ticket.category === Category.FINANCE) return true;
          // Sales Dept sees Sales
          if (currentUser.departmentId === 'D-SALES' && ticket.category === Category.SALES) return true;
      }
      
      return false;
  }, [hasPermission]);

  useEffect(() => {
    if (isAuthenticated) {
        refreshData();
        // Redirect logic based on permissions
        if (activeView === 'portal') {
            if (hasPermission(AppPermission.VIEW_ALL_TICKETS) || hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS)) {
                setActiveView('dashboard');
            }
        } else if (activeView === 'dashboard') {
            if (!hasPermission(AppPermission.VIEW_ALL_TICKETS) && !hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS)) {
                setActiveView('portal');
            }
        } else if (activeView === 'admin-console') {
            if (!hasPermission(AppPermission.MANAGE_SYSTEM) && !hasPermission(AppPermission.MANAGE_USERS)) {
                setActiveView('portal');
            }
        }
    }
  }, [isAuthenticated, user, hasPermission]); // Removed activeView from deps to prevent loop

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
      setActiveView('assets-inventory');
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
    // 1. Ticket Detail View
    if (activeView.startsWith('ticket-') && selectedTicketId) {
      const ticket = getTicketById(selectedTicketId);
      if (ticket) {
        // Enforce Access Control
        if (!checkTicketAccess(ticket, user)) {
             return <div className="p-8 text-center text-red-500 font-bold">Unauthorized: You do not have permission to view this ticket.</div>;
        }

        return (
          <TicketDetail 
            ticket={ticket} 
            currentUser={user!} 
            onBack={() => setActiveView((hasPermission(AppPermission.VIEW_ALL_TICKETS) || hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS)) ? 'dashboard' : 'my-tickets')}
            onUpdate={refreshData}
          />
        );
      }
    }

    // 2. Asset Detail View
    if (activeView.startsWith('asset-') && selectedAssetId) {
      const asset = getAssetById(selectedAssetId);
      if (asset) {
        // Enforce ownership if user cannot view all assets
        if (!hasPermission(AppPermission.VIEW_ALL_ASSETS)) {
            if (asset.assignedTo !== user?.id) {
                return <div className="p-8 text-center text-red-500 font-bold">Unauthorized: You do not have permission to view this asset.</div>;
            }
        }

        return (
           <AssetDetail 
             asset={asset}
             onBack={() => hasPermission(AppPermission.VIEW_ALL_ASSETS) ? setActiveView('assets-inventory') : setActiveView('my-tickets')}
             onSelectTicket={handleSelectTicket}
           />
        );
      }
    }

    // 3. Create Asset View
    if (activeView === 'assets-new') {
        if (!hasPermission(AppPermission.MANAGE_ASSETS)) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized Access</div>;
        return <AssetForm onAssetCreated={handleAssetCreated} onCancel={() => setActiveView('assets')} />;
    }

    // 4. Main Views
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
        if (!hasPermission(AppPermission.VIEW_ALL_TICKETS) && !hasPermission(AppPermission.VIEW_DEPARTMENT_TICKETS)) {
            return <div className="p-8 text-center text-red-500 font-bold">Unauthorized: Agent Access Required</div>;
        }
        
        // Filter tickets for Dashboard view
        const dashboardTickets = tickets.filter(t => checkTicketAccess(t, user));
        
        return <AgentDashboard tickets={dashboardTickets} onSelectTicket={handleSelectTicket} />;
      
      case 'assets':
          // The Main Assets View is now the Dashboard
          if (!hasPermission(AppPermission.VIEW_ALL_ASSETS)) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>;
          return <AssetDashboard 
                    onNavigateToInventory={() => setActiveView('assets-inventory')}
                    onNavigateToNewAsset={() => setActiveView('assets-new')}
                 />;

      case 'assets-inventory':
          if (!hasPermission(AppPermission.VIEW_ALL_ASSETS)) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>;
          return (
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">IT Assets Inventory</h2>
                        <span className="text-sm text-slate-500">Manage hardware, software, and organization allocations.</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setActiveView('assets')} className="text-slate-500 hover:text-indigo-600 font-medium text-sm">Back to Dashboard</button>
                        {hasPermission(AppPermission.MANAGE_ASSETS) && (
                            <button 
                                onClick={() => setActiveView('assets-new')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Register Asset
                            </button>
                        )}
                    </div>
                </div>
                <AssetList assets={assets} onSelectAsset={handleSelectAsset} />
            </div>
          );
      
      case 'analytics':
          if (!hasPermission(AppPermission.VIEW_ANALYTICS)) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>;
          return <AnalyticsDashboard />;
      
      case 'admin-console':
          if (!hasPermission(AppPermission.MANAGE_SYSTEM) && !hasPermission(AppPermission.MANAGE_USERS)) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized: Admin Access Required</div>;
          return <AdminDashboard />;
      
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Sidebar 
        activeView={activeView.startsWith('asset') ? 'assets' : activeView} 
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
        <LanguageProvider>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;