import React, { useState } from 'react';
import { Asset, AssetReport } from '../types';
import { getAssetWithDetails, getAssetHierarchy, getTicketsForAsset, getAssetReports, addAssetReport } from '../services/mockStore';
import { evaluateAssetHealth, generateAssetDiagnostic } from '../services/geminiService';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onSelectTicket: (id: string) => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset: rawAsset, onBack, onSelectTicket }) => {
  const asset = getAssetWithDetails(rawAsset);
  const children = getAssetHierarchy(asset.id);
  const linkedTickets = getTicketsForAsset(asset.id);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance'>('overview');
  const [aiAssessment, setAiAssessment] = useState<{recommendation: string, score: number, justification: string} | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Reporting State
  const [reports, setReports] = useState<AssetReport[]>(getAssetReports(asset.id));
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleEvaluate = async () => {
      setIsEvaluating(true);
      const result = await evaluateAssetHealth(rawAsset, asset.modelName || 'Unknown');
      setAiAssessment(result);
      setIsEvaluating(false);
  };

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      // Simulate scanning time
      await new Promise(r => setTimeout(r, 2000));
      
      const partialReport = await generateAssetDiagnostic(rawAsset, asset.modelName || 'Unknown');
      
      const newReport: AssetReport = {
          id: `RPT-${Date.now()}`,
          assetId: asset.id,
          generatedAt: Date.now(),
          generatedBy: 'System Agent',
          overallHealthScore: partialReport.overallHealthScore || 0,
          metrics: partialReport.metrics || [],
          aiRecommendations: partialReport.aiRecommendations || [],
          rawLogSummary: 'Scan completed successfully. No critical errors in kernel logs.'
      };
      
      addAssetReport(newReport);
      setReports([newReport, ...reports]);
      setIsGeneratingReport(false);
  };

  const warrantyDays = Math.ceil((asset.warrantyExpiry - Date.now()) / (1000 * 60 * 60 * 24));
  const warrantyWidth = Math.max(0, Math.min(100, (warrantyDays / 1095) * 100)); // Assuming 3 years max for bar

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Detail Header */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 flex justify-between items-start">
         <div className="flex items-start space-x-6">
             <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors mt-1">
                 <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             
             {asset.modelImage ? (
                 <img src={asset.modelImage} className="w-24 h-24 rounded-lg object-cover bg-slate-50 border border-slate-100 shadow-sm" alt="" />
             ) : (
                 <div className="w-24 h-24 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-300 border border-indigo-100">
                     <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 </div>
             )}
             
             <div>
                 <div className="flex items-center space-x-2">
                     <span className="text-2xl font-bold text-slate-900">{asset.assetCode}</span>
                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                         asset.status === 'In Use' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                     }`}>{asset.status}</span>
                 </div>
                 <h2 className="text-lg text-slate-700 font-medium mt-1">{asset.brandName} {asset.modelName}</h2>
                 <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                     <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> {asset.categoryName}</span>
                     <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {asset.location || 'No Location Set'}</span>
                 </div>
             </div>
         </div>
         <div className="flex space-x-2">
             <button onClick={handleEvaluate} className="btn-secondary px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 text-sm">AI Lifecycle Check</button>
             <button onClick={handleGenerateReport} className="btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 text-sm shadow-sm flex items-center" disabled={isGeneratingReport}>
                 {isGeneratingReport ? 'Scanning...' : 'Run Diagnostics'}
             </button>
         </div>
      </div>
      
      {/* AI Assessment Result (Conditional) */}
      {aiAssessment && (
         <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-4 animate-fade-in">
             <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
                 <h4 className="font-bold text-indigo-900">AI Lifecycle Recommendation: {aiAssessment.recommendation} (Score: {aiAssessment.score})</h4>
                 <p className="text-sm text-indigo-800 mt-1">{aiAssessment.justification}</p>
             </div>
         </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Specs & Info */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Basic & Specs */}
              <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                      <h3 className="font-bold text-slate-800 text-sm uppercase">Specifications & Details</h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Manufacturer</label>
                              <div className="font-medium text-slate-800">{asset.brandName}</div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Model</label>
                              <div className="font-medium text-slate-800">{asset.modelName}</div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Serial Number</label>
                              <div className="font-mono text-sm text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block">{asset.serialNumber}</div>
                          </div>
                           {asset.ipAddress && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Network</label>
                                    <div className="text-sm text-slate-800">IP: {asset.ipAddress}</div>
                                    {asset.macAddress && <div className="text-xs text-slate-500">MAC: {asset.macAddress}</div>}
                                </div>
                           )}
                      </div>
                      
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Technical Specs</label>
                          {asset.specs && Object.entries(asset.specs).map(([key, val]) => (
                              <div key={key} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1 last:border-0">
                                  <span className="text-slate-500">{key}</span>
                                  <span className="font-medium text-slate-800">{val}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Maintenance History & Tickets */}
              <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm uppercase">Support History</h3>
                      <span className="text-xs text-slate-500">{linkedTickets.length} Records</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {reports.length > 0 && (
                           <div className="p-4 bg-blue-50/50">
                               <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Recent Diagnostics</h4>
                               <div className="flex gap-4 overflow-x-auto pb-2">
                                   {reports.slice(0, 3).map(r => (
                                       <div key={r.id} className="min-w-[200px] bg-white p-3 rounded border border-blue-100 shadow-sm">
                                           <div className="flex justify-between items-center mb-2">
                                               <span className="text-[10px] text-slate-400">{new Date(r.generatedAt).toLocaleDateString()}</span>
                                               <span className={`text-[10px] font-bold px-1.5 rounded ${r.overallHealthScore > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>Score: {r.overallHealthScore}</span>
                                           </div>
                                           <div className="text-xs text-slate-600 truncate">{r.rawLogSummary}</div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                      )}
                      
                      {linkedTickets.map(ticket => (
                           <div key={ticket.id} onClick={() => onSelectTicket(ticket.id)} className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
                               <div className="flex items-center space-x-3">
                                   <div className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                   <div>
                                       <div className="text-sm font-medium text-slate-800">{ticket.title}</div>
                                       <div className="text-xs text-slate-500">#{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
                                   </div>
                               </div>
                               <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">{ticket.category}</span>
                           </div>
                      ))}
                      {linkedTickets.length === 0 && (
                          <div className="p-8 text-center text-slate-400 italic text-sm">No support tickets filed for this asset.</div>
                      )}
                  </div>
              </div>

          </div>

          {/* Right Column: Status, Assignment, Financials */}
          <div className="space-y-6">
              
              {/* Assignment Card */}
              <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Current Assignment</h4>
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {asset.assignedTo ? asset.assignedTo.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                          <div className="font-bold text-slate-900">{asset.assigneeName || 'Unassigned'}</div>
                          <div className="text-xs text-slate-500">{asset.departmentName}</div>
                      </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Assignment Date</span>
                          <span className="font-medium">{asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString() : '-'}</span>
                      </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Condition</span>
                          <span className="font-medium flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                  asset.condition === 'New' || asset.condition === 'Excellent' ? 'bg-green-500' : 
                                  asset.condition === 'Good' ? 'bg-blue-500' : 'bg-red-500'
                              }`}></span>
                              {asset.condition}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Warranty & Financials */}
              <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                   <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Warranty & Purchase</h4>
                   
                   <div className="mb-6">
                       <div className="flex justify-between text-sm mb-1">
                           <span className="font-medium text-slate-700">Warranty Status</span>
                           <span className={`font-bold ${warrantyDays > 0 ? 'text-green-600' : 'text-red-600'}`}>
                               {warrantyDays > 0 ? `${warrantyDays} Days Left` : 'Expired'}
                           </span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                           <div className={`h-full rounded-full ${warrantyDays > 90 ? 'bg-green-500' : warrantyDays > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${warrantyWidth}%` }}></div>
                       </div>
                       <div className="flex justify-between text-xs text-slate-400 mt-1">
                           <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                           <span>{new Date(asset.warrantyExpiry).toLocaleDateString()}</span>
                       </div>
                   </div>

                   <div className="space-y-3">
                        <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Purchase Cost</span>
                          <span className="font-bold text-slate-800">${asset.purchaseCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Supplier</span>
                          <span className="font-medium text-slate-800">{asset.supplier || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Current Value (Est)</span>
                          <span className="font-medium text-slate-800">${Math.max(0, Math.floor(asset.purchaseCost * (1 - ((Date.now() - asset.purchaseDate) / (1000 * 60 * 60 * 24 * 365)) * 0.25))).toLocaleString()}</span>
                      </div>
                   </div>
              </div>

          </div>
      </div>
    </div>
  );
};