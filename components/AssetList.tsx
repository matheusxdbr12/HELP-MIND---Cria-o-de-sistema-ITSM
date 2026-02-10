import React from 'react';
import { Asset, AssetStatus } from '../types';
import { getAssetWithDetails } from '../services/mockStore';

interface AssetListProps {
  assets: Asset[];
  onSelectAsset: (id: string) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onSelectAsset }) => {
  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Tag</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand / Model</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((rawAsset) => {
              const asset = getAssetWithDetails(rawAsset);
              const warrantyDays = Math.ceil((asset.warrantyExpiry - Date.now()) / (1000 * 60 * 60 * 24));
              const isWarrantyExpired = warrantyDays <= 0;

              return (
                <tr 
                  key={asset.id} 
                  onClick={() => onSelectAsset(asset.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-mono text-slate-500 group-hover:text-indigo-600">
                    <div className="flex items-center space-x-3">
                         {asset.modelImage ? (
                             <img src={asset.modelImage} alt="" className="w-8 h-8 rounded bg-slate-100 object-cover" />
                         ) : (
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                            </div>
                         )}
                         <div className="flex flex-col">
                             <span className="font-bold text-slate-700">#{asset.id}</span>
                             <span className="text-[10px] text-slate-400">{asset.serialNumber}</span>
                         </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{asset.brandName} {asset.modelName}</p>
                    <p className="text-xs text-slate-500">{asset.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                      {asset.departmentName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              {asset.departmentName}
                          </span>
                      ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        asset.status === AssetStatus.IN_USE ? 'bg-green-100 text-green-700' :
                        asset.status === AssetStatus.IN_STOCK ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">${asset.purchaseCost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                              asset.condition === 'Excellent' || asset.condition === 'New' ? 'bg-green-500' :
                              asset.condition === 'Good' ? 'bg-blue-500' :
                              asset.condition === 'Broken' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          {asset.condition}
                      </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
