import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getAuditLogs, getSystemConfig, getSystemHealth, updateSystemConfig, toggleUserStatus, adminResetPassword } from '../../services/mockStore';
import { User, AuditLog, SystemConfig, SystemHealth } from '../../types';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'config'>('overview');
    const [health, setHealth] = useState<SystemHealth>(getSystemHealth());
    const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
    const [logs, setLogs] = useState<AuditLog[]>(getAuditLogs());
    const [users, setUsers] = useState<User[]>(getAllUsers());

    const refreshData = () => {
        setHealth(getSystemHealth());
        setConfig(getSystemConfig());
        setLogs(getAuditLogs());
        setUsers(getAllUsers());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 5000); // Polling for dashboards
        return () => clearInterval(interval);
    }, []);

    const handleConfigToggle = (key: keyof SystemConfig) => {
        if (!user) return;
        updateSystemConfig(user.id, { [key]: !config[key] });
        refreshData();
    };

    const handleUserAction = (targetUserId: string, action: 'SUSPEND' | 'ACTIVATE' | 'RESET') => {
        if (!user) return;
        if (action === 'RESET') {
            if(window.confirm("Are you sure? This will set a temporary password.")) {
                adminResetPassword(user.id, targetUserId);
            }
        } else {
            toggleUserStatus(user.id, targetUserId, action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE');
        }
        refreshData();
    };

    const OverviewTab = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border shadow-sm ${health.status === 'HEALTHY' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-xs uppercase font-bold text-slate-500">System Status</div>
                    <div className={`text-2xl font-bold ${health.status === 'HEALTHY' ? 'text-green-700' : 'text-red-700'}`}>{health.status}</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs uppercase font-bold text-slate-500">Active Users</div>
                    <div className="text-2xl font-bold text-slate-800">{health.activeUsers}</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs uppercase font-bold text-slate-500">DB Latency</div>
                    <div className="text-2xl font-bold text-slate-800">{health.databaseLatency}ms</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-xs uppercase font-bold text-slate-500">Pending Jobs</div>
                    <div className="text-2xl font-bold text-slate-800">{health.pendingJobs}</div>
                </div>
            </div>

            {/* Emergency Controls */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Emergency System Controls
                </h3>
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleConfigToggle('lockdownMode')}
                        className={`px-6 py-3 rounded-lg font-bold shadow-md transition-all ${config.lockdownMode ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-600 border border-red-300 hover:bg-red-100'}`}
                    >
                        {config.lockdownMode ? 'DISABLE LOCKDOWN' : 'INITIATE SYSTEM LOCKDOWN'}
                    </button>
                    <button 
                        onClick={() => handleConfigToggle('maintenanceMode')}
                        className={`px-6 py-3 rounded-lg font-bold shadow-md transition-all ${config.maintenanceMode ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-100'}`}
                    >
                        {config.maintenanceMode ? 'Exit Maintenance Mode' : 'Enter Maintenance Mode'}
                    </button>
                </div>
                <p className="text-xs text-red-700 mt-4">
                    <strong>Lockdown Mode:</strong> Rejects all non-admin requests, kills active sessions, and restricts API access.
                </p>
            </div>
        </div>
    );

    const UsersTab = () => (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden animate-fade-in">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="font-medium text-slate-900">{u.name}</div>
                                    <div className="text-xs text-slate-500 ml-2">({u.email})</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {u.status || 'ACTIVE'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                    {u.id !== user?.id && (
                                        <>
                                            <button 
                                                onClick={() => handleUserAction(u.id, u.status === 'SUSPENDED' ? 'ACTIVATE' : 'SUSPEND')}
                                                className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${u.status === 'SUSPENDED' ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                                            >
                                                {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                            </button>
                                            <button 
                                                onClick={() => handleUserAction(u.id, 'RESET')}
                                                className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                                            >
                                                Reset Pass
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const SecurityTab = () => (
        <div className="bg-slate-900 rounded-xl shadow border border-slate-800 overflow-hidden animate-fade-in text-slate-300 font-mono text-sm">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-bold text-slate-100">System Audit Log</h3>
                <span className="text-xs text-slate-500">Live Stream</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-xs uppercase">Time</th>
                            <th className="px-4 py-3 text-xs uppercase">Severity</th>
                            <th className="px-4 py-3 text-xs uppercase">Action</th>
                            <th className="px-4 py-3 text-xs uppercase">Actor</th>
                            <th className="px-4 py-3 text-xs uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-3 whitespace-nowrap opacity-70">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        log.severity === 'CRITICAL' ? 'bg-red-900 text-red-200' :
                                        log.severity === 'WARNING' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
                                    }`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-indigo-400 font-bold">{log.action}</td>
                                <td className="px-4 py-3 text-slate-300">{log.actorName}</td>
                                <td className="px-4 py-3 opacity-80 truncate max-w-md">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Super Admin Console</h1>
                    <p className="text-slate-500">Global system oversight and configuration.</p>
                </div>
                <div className="bg-indigo-900 text-indigo-100 px-4 py-2 rounded-lg text-sm font-mono">
                    v{config.systemVersion} | {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    System Overview
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    User Management
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'security' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Audit Logs
                </button>
            </div>

            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'security' && <SecurityTab />}
        </div>
    );
};