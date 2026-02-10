import React, { useState, useMemo } from 'react';
import { Asset, AssetStatus, AssetCondition } from '../types';
import { getAssetWithDetails, getAssetCategories } from '../services/mockStore';

interface AssetListProps {
  assets: Asset[];
  onSelectAsset: (id: string) => void;
}

// Icon mapper for SVG path data
const ICONS: Record<string, React.ReactElement> = {
    'desktop': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    'laptop': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, 
    'monitor': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />,
    'mouse': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
    'server': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />,
    'network': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
    'code': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    'default': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
};

export const AssetList: React.FC<AssetListProps> = ({ assets, onSelectAsset }) => {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const categories = getAssetCategories();
  
  const filteredAssets = useMemo(() => {
    return assets.map(a => getAssetWithDetails(a)).filter(asset => {
        if (filterCategory && asset.categoryId !== filterCategory) return false;
        if (filterStatus && asset.status !== filterStatus) return false;
        if (search) {
            const term = search.toLowerCase();
            return (
                asset.name.toLowerCase().includes(term) ||
                asset.assetCode.toLowerCase().includes(term) ||
                asset.serialNumber.toLowerCase().includes(term) ||
                asset.modelName?.toLowerCase().includes(term)
            );
        }
        return true;
    });
  }, [assets, filterCategory, filterStatus, search]);

  const totalValue = filteredAssets.reduce((acc, a) => acc + a.purchaseCost, 0);

  // Helper to map DB values to CSS classes for badges
  const getCategoryClass = (icon: string) => {
      if (icon === 'desktop') return 'computer';
      if (icon === 'laptop') return 'notebook';
      if (icon === 'monitor') return 'monitor';
      if (icon === 'server') return 'server';
      if (icon === 'code') return 'software';
      return 'default';
  };

  const getStatusClass = (status: string) => {
      return status.toLowerCase().replace(' ', '_');
  };

  return (
    <div className="space-y-4 animate-fade-in">
        {/* Filters Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
                 <div className="relative max-w-xs w-full">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                     <input
                         type="text"
                         className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                         placeholder="Search assets..."
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                     />
                 </div>
                 
                 <select 
                    className="block w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                 >
                     <option value="">All Categories</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>

                 <select 
                    className="block w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                 >
                     <option value="">All Statuses</option>
                     {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span>Showing <span className="font-bold text-slate-800">{filteredAssets.length}</span> assets</span>
                <span className="border-l border-slate-300 pl-4">Value: <span className="font-bold text-slate-800">${totalValue.toLocaleString()}</span></span>
            </div>
        </div>

        {/* Table Container using new visual system */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="asset-table">
                    <thead>
                        <tr>
                            <th>Asset Code</th>
                            <th>Category</th>
                            <th>Model / Details</th>
                            <th>Specifications</th>
                            <th>Status</th>
                            <th>Location / User</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => {
                            const iconKey = asset.categoryIcon || 'default';
                            return (
                                <tr 
                                    key={asset.id} 
                                    onClick={() => onSelectAsset(asset.id)}
                                    className="cursor-pointer"
                                >
                                    <td>
                                        <span className="font-mono text-xs font-medium text-slate-700">
                                            {asset.assetCode}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`category-badge ${getCategoryClass(iconKey)}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {ICONS[iconKey] || ICONS['default']}
                                            </svg>
                                            {asset.categoryName}
                                        </span>
                                        {asset.subcategoryName && <div className="text-[10px] text-slate-400 mt-1 pl-1">{asset.subcategoryName}</div>}
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{asset.modelName || asset.name}</span>
                                            <span className="text-xs text-slate-500 font-mono">{asset.serialNumber}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {asset.specs && Object.entries(asset.specs).slice(0, 3).map(([k, v]) => (
                                                <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-600 border border-slate-100 truncate">
                                                    <span className="opacity-60 mr-1">{k}:</span> {v}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            {asset.assigneeName ? (
                                                <div className="flex items-center space-x-1.5 mb-1">
                                                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold">
                                                        {asset.assigneeName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-slate-700 font-medium">{asset.assigneeName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic mb-1">Unassigned</span>
                                            )}
                                            {asset.location && (
                                                <span className="text-xs text-slate-500 flex items-center">
                                                    <svg className="w-3 h-3 mr-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {asset.location}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="View Details">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredAssets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                    No assets match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};