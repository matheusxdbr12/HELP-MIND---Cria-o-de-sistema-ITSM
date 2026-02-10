import React from 'react';
import { getBrands, getAssetCategories } from '../services/mockStore';
import { AssetStatus, AssetCondition } from '../types';

interface FilterState {
    categories: string[];
    statuses: string[];
    conditions: string[];
    brands: string[];
    priceRange: [number, number];
    location: string;
}

interface AssetFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    locations: string[];
}

export const AssetFilterPanel: React.FC<AssetFilterPanelProps> = ({ isOpen, onClose, filters, onFilterChange, locations }) => {
    const brands = getBrands();
    const categories = getAssetCategories();

    const toggleArrayItem = (key: keyof FilterState, value: string) => {
        const current = filters[key] as string[];
        const updated = current.includes(value) 
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [key]: updated });
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Filters</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Categories */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Category</h3>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        checked={filters.categories.includes(cat.id)}
                                        onChange={() => toggleArrayItem('categories', cat.id)}
                                    />
                                    <span className="text-sm text-slate-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Status</h3>
                        <div className="space-y-2">
                            {Object.values(AssetStatus).map(status => (
                                <label key={status} className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        checked={filters.statuses.includes(status)}
                                        onChange={() => toggleArrayItem('statuses', status)}
                                    />
                                    <span className="text-sm text-slate-700">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Condition</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(AssetCondition).map(cond => (
                                <button 
                                    key={cond}
                                    onClick={() => toggleArrayItem('conditions', cond)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        filters.conditions.includes(cond) 
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {cond}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Location</h3>
                        <select 
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            value={filters.location}
                            onChange={(e) => onFilterChange({...filters, location: e.target.value})}
                        >
                            <option value="">All Locations</option>
                            {locations.map((loc, i) => (
                                <option key={i} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brands */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Manufacturer</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {brands.map(brand => (
                                <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        checked={filters.brands.includes(brand.id)}
                                        onChange={() => toggleArrayItem('brands', brand.id)}
                                    />
                                    <span className="text-sm text-slate-700">{brand.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                        onClick={() => onFilterChange({
                            categories: [], statuses: [], conditions: [], brands: [], priceRange: [0, 10000], location: ''
                        })}
                        className="flex-1 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors"
                    >
                        Reset All
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
};