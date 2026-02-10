import React, { useState } from 'react';
import { getBrands, getModels, getDepartments, addAsset, USERS } from '../services/mockStore';
import { Asset, AssetType, AssetStatus, AssetCondition, Brand, Model } from '../types';

interface AssetFormProps {
  onAssetCreated: () => void;
  onCancel: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ onAssetCreated, onCancel }) => {
  const brands = getBrands();
  const allModels = getModels();
  const departments = getDepartments();

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [condition, setCondition] = useState<AssetCondition>(AssetCondition.NEW);
  const [assignedUser, setAssignedUser] = useState('');

  // Filter models based on brand
  const filteredModels = allModels.filter(m => m.brandId === selectedBrandId);
  const selectedModel = allModels.find(m => m.id === selectedModelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId || !selectedModelId || !serialNumber) return;

    const newAsset: Asset = {
        id: `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        brandId: selectedBrandId,
        modelId: selectedModelId,
        departmentId,
        name: selectedModel ? `${selectedModel.name} - ${serialNumber.slice(-4)}` : 'New Asset',
        serialNumber,
        type: selectedModel ? selectedModel.category : AssetType.HARDWARE,
        status: assignedUser ? AssetStatus.IN_USE : AssetStatus.IN_STOCK,
        condition,
        purchaseDate: Date.now(),
        purchaseCost: Number(purchaseCost) || 0,
        warrantyExpiry: Date.now() + (selectedModel ? selectedModel.warrantyPeriodMonths * 30 * 24 * 60 * 60 * 1000 : 31536000000),
        assignedTo: assignedUser,
        specs: selectedModel?.specsTemplate // Copy template specs
    };

    addAsset(newAsset);
    onAssetCreated();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Register New Asset</h2>
                <p className="text-slate-500 text-sm">Add equipment to the organization registry</p>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Catalog Selection */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-indigo-100 pb-2">1. Catalog Details</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <select 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={selectedBrandId}
                        onChange={e => { setSelectedBrandId(e.target.value); setSelectedModelId(''); }}
                        required
                    >
                        <option value="">Select Brand...</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                    <select 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        value={selectedModelId}
                        onChange={e => setSelectedModelId(e.target.value)}
                        disabled={!selectedBrandId}
                        required
                    >
                        <option value="">Select Model...</option>
                        {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>

                {selectedModel && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start space-x-4">
                        {selectedModel.imageUrl && <img src={selectedModel.imageUrl} className="w-16 h-16 rounded object-cover bg-white" alt="" />}
                        <div>
                            <div className="font-bold text-indigo-900">{selectedModel.name}</div>
                            <div className="text-xs text-indigo-700 mt-1">Warranty: {selectedModel.warrantyPeriodMonths} Months</div>
                            <div className="text-xs text-indigo-700">Type: {selectedModel.category}</div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                        placeholder="e.g. SN-12345678"
                        value={serialNumber}
                        onChange={e => setSerialNumber(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Column 2: Financials & Assignment */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-indigo-100 pb-2">2. Financials & Assignment</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Cost ($)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                            value={purchaseCost}
                            onChange={e => setPurchaseCost(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                         <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={condition}
                            onChange={e => setCondition(e.target.value as AssetCondition)}
                         >
                             {Object.values(AssetCondition).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department Owner</label>
                    <select 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={departmentId}
                        onChange={e => setDepartmentId(e.target.value)}
                        required
                    >
                        <option value="">Select Department...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.costCenter})</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign User (Optional)</label>
                    <select 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={assignedUser}
                        onChange={e => setAssignedUser(e.target.value)}
                    >
                        <option value="">Keep in Stock</option>
                        {Object.values(USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100 space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">Register Asset</button>
            </div>
        </form>
    </div>
  );
};
