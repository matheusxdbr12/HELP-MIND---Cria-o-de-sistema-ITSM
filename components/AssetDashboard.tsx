import React from 'react';
import { getAssetStats, getRecentAssetActivity } from '../services/mockStore';

interface AssetDashboardProps {
    onNavigateToInventory: () => void;
    onNavigateToNewAsset: () => void;
}

export const AssetDashboard: React.FC<AssetDashboardProps> = ({ onNavigateToInventory, onNavigateToNewAsset }) => {
    const stats = getAssetStats();
    const activity = getRecentAssetActivity();

    // Helper for pie chart gradient
    const generatePieGradient = (data: Record<string, number>) => {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        let currentAngle = 0;
        const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        const segments = Object.entries(data).map(([key, value], index) => {
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;
            const color = colors[index % colors.length];
            const start = currentAngle;
            currentAngle += angle;
            return `${color} ${start}deg ${currentAngle}deg`;
        });

        return `conic-gradient(${segments.join(', ')})`;
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Asset Management Dashboard</h1>
                    <p className="text-slate-500">Overview of hardware, software, and allocation metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onNavigateToNewAsset} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Asset
                    </button>
                    <button onClick={onNavigateToInventory} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
                        View Inventory
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Assets</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalAssets}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            +12% vs last month
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Assigned Ratio</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{Math.round((stats.assignedCount / stats.totalAssets) * 100)}%</p>
                        <p className="text-xs text-slate-500 mt-1">{stats.assignedCount} in use</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">In Maintenance</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.maintenanceCount}</p>
                        <p className="text-xs text-orange-600 mt-1">Requires Action</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Warranty Alerts</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.expiringCount}</p>
                        <p className="text-xs text-red-600 mt-1">Expiring in 90 days</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Visualizations */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800">Asset Distribution</h3>
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View Report</button>
                        </div>
                        <div className="flex items-center justify-center space-x-12">
                            <div 
                                className="w-48 h-48 rounded-full shadow-inner border-4 border-white ring-1 ring-slate-100 relative"
                                style={{ background: generatePieGradient(stats.categoryCounts) }}
                            >
                                <div className="absolute inset-0 m-12 bg-white rounded-full flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800">{stats.totalAssets}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(stats.categoryCounts).map(([cat, count], i) => {
                                    const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500'];
                                    return (
                                        <div key={cat} className="flex items-center text-sm">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${colors[i % colors.length]}`}></div>
                                            <span className="text-slate-600 w-24 truncate">{cat}</span>
                                            <span className="font-bold text-slate-800">{count as number}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                        <div className="space-y-0">
                            {activity.map((item, idx) => (
                                <div key={item.id} className="flex space-x-4 pb-4 last:pb-0 relative">
                                    {idx !== activity.length - 1 && <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-slate-100"></div>}
                                    <div className="mt-1">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                                            {item.icon === 'plus' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                                            {item.icon === 'user-check' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                            {item.icon === 'alert-triangle' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                            {item.icon === 'check-circle' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                            <span className="text-xs text-slate-400">{item.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Value */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Status Overview</h3>
                        <div className="space-y-4">
                            {Object.entries(stats.statusCounts).map(([status, count]) => {
                                const max = Math.max(...Object.values(stats.statusCounts) as number[]);
                                const val = count as number;
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-slate-600 uppercase">{status}</span>
                                            <span className="font-bold text-slate-900">{val}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    status === 'In Use' ? 'bg-green-500' :
                                                    status === 'In Stock' ? 'bg-blue-500' :
                                                    status === 'Under Maintenance' ? 'bg-orange-500' : 'bg-slate-400'
                                                }`}
                                                style={{ width: `${(val / max) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl shadow p-6 text-white">
                        <h3 className="font-bold text-slate-100 mb-2">Total Asset Value</h3>
                        <div className="text-4xl font-bold text-white mb-1">${stats.totalValue.toLocaleString()}</div>
                        <p className="text-xs text-slate-400 opacity-80">Estimated current value based on purchase cost.</p>
                        
                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Next Audit</span>
                                <span className="font-mono text-indigo-400">Oct 15, 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
