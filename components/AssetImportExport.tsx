import React, { useState } from 'react';
import { Asset, AssetType, AssetStatus, AssetCondition } from '../types';
import { addAsset, getAssets, getAssetWithDetails } from '../services/mockStore';

interface AssetImportExportProps {
    onClose: () => void;
    onImportComplete: () => void;
}

export const AssetImportExport: React.FC<AssetImportExportProps> = ({ onClose, onImportComplete }) => {
    const [mode, setMode] = useState<'IMPORT' | 'EXPORT'>('EXPORT');
    const [importData, setImportData] = useState<string>('');
    const [importPreview, setImportPreview] = useState<Partial<Asset>[]>([]);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Export State
    const [exportFormat, setExportFormat] = useState('CSV');
    const [selectedFields, setSelectedFields] = useState({
        basic: true,
        specs: true,
        financials: true,
        assignment: true
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setImportData(text);
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const parseCSV = (csvText: string) => {
        try {
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const parsed: Partial<Asset>[] = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',');
                const asset: any = { id: `A-IMP-${Date.now()}-${i}`, createdAt: Date.now() };
                
                headers.forEach((h, idx) => {
                    if (h === 'name') asset.name = values[idx];
                    if (h === 'serial') asset.serialNumber = values[idx];
                    if (h === 'cost') asset.purchaseCost = parseFloat(values[idx]);
                    if (h === 'brand') asset.brandId = 'B-DELL'; // Mock default
                    if (h === 'model') asset.modelId = 'M-XPS15'; // Mock default
                });
                
                // Defaults
                asset.status = AssetStatus.IN_STOCK;
                asset.condition = AssetCondition.NEW;
                asset.categoryId = 'CAT-COMP';
                asset.type = AssetType.HARDWARE;
                asset.assetCode = `AST-${Math.floor(Math.random() * 100000)}`;
                asset.purchaseDate = Date.now();
                asset.warrantyExpiry = Date.now() + 31536000000;

                parsed.push(asset);
            }
            setImportPreview(parsed);
            setError('');
        } catch (e) {
            setError('Failed to parse CSV. Please check format.');
        }
    };

    const confirmImport = async () => {
        setIsProcessing(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 1500));
        importPreview.forEach(asset => addAsset(asset as Asset));
        setIsProcessing(false);
        onImportComplete();
        onClose();
    };

    const handleExport = () => {
        setIsProcessing(true);
        const assets = getAssets().map(a => getAssetWithDetails(a));
        
        let csvContent = "data:text/csv;charset=utf-8,";
        // Headers
        csvContent += "Asset Code,Name,Category,Model,Serial,Status,Assigned To,Location,Cost\n";
        
        assets.forEach(a => {
            const row = [
                a.assetCode,
                `"${a.name}"`,
                a.categoryName,
                a.modelName,
                a.serialNumber,
                a.status,
                a.assigneeName || 'Unassigned',
                `"${a.location || ''}"`,
                a.purchaseCost
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `asset_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex border-b border-slate-200">
                    <button 
                        onClick={() => setMode('EXPORT')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'EXPORT' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        Export Data
                    </button>
                    <button 
                        onClick={() => setMode('IMPORT')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'IMPORT' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        Import Assets
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {mode === 'EXPORT' ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Export Configuration</h3>
                                <p className="text-slate-500 text-sm">Select the data fields and format for your report.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 border rounded-lg cursor-pointer transition-all ${exportFormat === 'CSV' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setExportFormat('CSV')}>
                                    <div className="font-bold text-slate-800">CSV Format</div>
                                    <div className="text-xs text-slate-500 mt-1">Universal compatibility</div>
                                </div>
                                <div className={`p-4 border rounded-lg cursor-pointer transition-all ${exportFormat === 'JSON' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setExportFormat('JSON')}>
                                    <div className="font-bold text-slate-800">JSON Format</div>
                                    <div className="text-xs text-slate-500 mt-1">For API integrations</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={selectedFields.basic} onChange={e => setSelectedFields({...selectedFields, basic: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                    <span className="text-slate-700">Basic Information (ID, Name, Serial)</span>
                                </label>
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={selectedFields.financials} onChange={e => setSelectedFields({...selectedFields, financials: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                    <span className="text-slate-700">Financials (Cost, Purchase Date, Warranty)</span>
                                </label>
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={selectedFields.assignment} onChange={e => setSelectedFields({...selectedFields, assignment: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                    <span className="text-slate-700">Assignment & Location Data</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="text-slate-700 font-medium">Drag & drop CSV file here</p>
                                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                            </div>

                            {importData && (
                                <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Preview ({importPreview.length} records)</h4>
                                    {error ? (
                                        <p className="text-red-600 text-sm">{error}</p>
                                    ) : (
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr>
                                                    <th className="pb-2 text-slate-500">Name</th>
                                                    <th className="pb-2 text-slate-500">Serial</th>
                                                    <th className="pb-2 text-slate-500">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importPreview.map((item, i) => (
                                                    <tr key={i} className="border-t border-slate-200">
                                                        <td className="py-2 text-slate-800">{item.name}</td>
                                                        <td className="py-2 text-slate-600 font-mono">{item.serialNumber}</td>
                                                        <td className="py-2 text-slate-600">${item.purchaseCost}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
                    {mode === 'EXPORT' ? (
                        <button 
                            onClick={handleExport}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm flex items-center"
                        >
                            {isProcessing ? 'Generating...' : 'Download Export'}
                        </button>
                    ) : (
                        <button 
                            onClick={confirmImport}
                            disabled={isProcessing || importPreview.length === 0}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm"
                        >
                            {isProcessing ? 'Importing...' : `Import ${importPreview.length} Assets`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};