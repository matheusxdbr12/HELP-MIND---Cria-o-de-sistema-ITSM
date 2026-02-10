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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'hierarchy' | 'reports'>('overview');
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-5">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            {asset.modelImage ? (
                <img src={asset.modelImage} className="w-20 h-20 rounded-lg object-cover bg-slate-50 border border-slate-100" alt="" />
            ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            )}
            <div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{asset.brandName}</span>
                    <span className="text-xs font-mono text-slate-400">#{asset.id}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">{asset.modelName}</h1>
                <p className="text-slate-500 text-sm">{asset.name} • S/N: {asset.serialNumber}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="flex flex-col items-end">
                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                     asset.status === 'In Use' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                 }`}>
                    {asset.status}
                 </span>
                 <span className="text-xs text-slate-400 mt-2">Dept: {asset.departmentName || 'Unassigned'}</span>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-8 border-b border-slate-100">
            {['overview', 'reports', 'financials', 'hierarchy'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab === 'reports' ? 'Health & Diagnostics' : tab}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                  <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Technical Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                          {asset.specs && Object.entries(asset.specs).map(([k, v]) => (
                              <div key={k} className="bg-slate-50 p-3 rounded border border-slate-100">
                                  <span className="block text-xs text-slate-500 uppercase">{k}</span>
                                  <span className="block font-medium text-slate-800">{v}</span>
                              </div>
                          ))}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mt-8 mb-4">Support History</h3>
                      <div className="space-y-3">
                          {linkedTickets.length > 0 ? linkedTickets.map(ticket => (
                              <div key={ticket.id} onClick={() => onSelectTicket(ticket.id)} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                  <div className="flex items-center space-x-3">
                                      <div className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                      <div>
                                          <p className="text-sm font-medium text-slate-800">{ticket.title}</p>
                                          <p className="text-xs text-slate-500">#{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                              </div>
                          )) : (
                              <p className="text-slate-400 text-sm italic">No tickets reported.</p>
                          )}
                      </div>
                  </div>
              )}

               {/* Reports Tab */}
              {activeTab === 'reports' && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                           <div>
                               <h3 className="font-bold text-slate-800">Diagnostic Hub</h3>
                               <p className="text-sm text-slate-500">Run automated health checks on this device.</p>
                           </div>
                           <button 
                               onClick={handleGenerateReport}
                               disabled={isGeneratingReport}
                               className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                           >
                               {isGeneratingReport ? (
                                   <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Running Scan...
                                   </>
                               ) : (
                                   <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Run Diagnostic
                                   </>
                               )}
                           </button>
                       </div>

                       {reports.length > 0 ? reports.map(report => (
                           <div key={report.id} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                               <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                   <div>
                                       <span className="text-xs font-bold uppercase text-slate-500">Report ID: {report.id}</span>
                                       <div className="text-sm font-medium text-slate-800">{new Date(report.generatedAt).toLocaleString()}</div>
                                   </div>
                                   <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                       report.overallHealthScore > 80 ? 'bg-green-100 text-green-700' : 
                                       report.overallHealthScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                   }`}>
                                       Health Score: {report.overallHealthScore}/100
                                   </div>
                               </div>
                               <div className="p-6">
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                       {report.metrics.map((metric, idx) => (
                                           <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                                               <div className="text-xs text-slate-500 uppercase">{metric.name}</div>
                                               <div className="flex items-center justify-between mt-1">
                                                   <span className="font-bold text-slate-800">{metric.value}</span>
                                                   <span className={`w-2 h-2 rounded-full ${
                                                       metric.status === 'OK' ? 'bg-green-500' : 
                                                       metric.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                                                   }`}></span>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                                   
                                   <div className="mb-4">
                                       <h4 className="text-sm font-bold text-indigo-900 mb-2">AI Recommendations</h4>
                                       <ul className="list-disc list-inside space-y-1">
                                           {report.aiRecommendations.map((rec, i) => (
                                               <li key={i} className="text-sm text-slate-700">{rec}</li>
                                           ))}
                                       </ul>
                                   </div>
                                   <div className="text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded">
                                       System Log: {report.rawLogSummary}
                                   </div>
                               </div>
                           </div>
                       )) : (
                           <div className="text-center py-10 text-slate-400 italic">No reports generated yet. Run a diagnostic scan to see data.</div>
                       )}
                  </div>
              )}

              {/* Financials Tab */}
              {activeTab === 'financials' && (
                  <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                      <div className="grid grid-cols-2 gap-8 mb-8">
                          <div>
                              <span className="text-xs text-slate-500 uppercase font-bold">Purchase Cost</span>
                              <p className="text-2xl font-bold text-slate-800">${asset.purchaseCost.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">Purchased {new Date(asset.purchaseDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                              <span className="text-xs text-slate-500 uppercase font-bold">Current Value (Est.)</span>
                              <p className="text-2xl font-bold text-slate-800">
                                  ${Math.max(0, Math.floor(asset.purchaseCost * (1 - ((Date.now() - asset.purchaseDate) / (1000 * 60 * 60 * 24 * 365)) * 0.25))).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-400">Straight-line deprec. (25%/yr)</p>
                          </div>
                      </div>

                      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-indigo-900">AI Lifecycle Analysis</h3>
                              <button 
                                onClick={handleEvaluate} 
                                disabled={isEvaluating}
                                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
                              >
                                  {isEvaluating ? 'Analyzing...' : 'Run Evaluation'}
                              </button>
                          </div>
                          
                          {aiAssessment ? (
                              <div className="animate-fade-in">
                                  <div className="flex items-center space-x-4 mb-3">
                                      <span className={`px-3 py-1 rounded font-bold text-sm ${
                                          aiAssessment.recommendation === 'Refresh' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                      }`}>
                                          Recommendation: {aiAssessment.recommendation}
                                      </span>
                                      <span className="text-sm text-indigo-800 font-medium">Score: {aiAssessment.score}/100</span>
                                  </div>
                                  <p className="text-sm text-indigo-800 leading-relaxed">{aiAssessment.justification}</p>
                              </div>
                          ) : (
                              <p className="text-sm text-indigo-400 italic">Run analysis to see replacement recommendations based on age, condition, and maintenance costs.</p>
                          )}
                      </div>
                  </div>
              )}

              {/* Hierarchy Tab */}
              {activeTab === 'hierarchy' && (
                  <div className="bg-white rounded-xl shadow border border-slate-200 p-6 min-h-[400px]">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Asset Relationship Tree</h3>
                      
                      {/* Tree Visualization */}
                      <div className="pl-4 border-l-2 border-slate-200 space-y-6">
                          {/* Parent (Self) */}
                          <div className="relative">
                              <div className="absolute -left-[25px] top-3 w-4 h-0.5 bg-slate-200"></div>
                              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 shadow-sm relative z-10">
                                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ROOT</span>
                                  <div className="font-bold text-indigo-900">{asset.modelName}</div>
                                  <div className="text-xs text-indigo-600">This Asset ({asset.id})</div>
                              </div>
                              
                              {/* Children */}
                              {children.length > 0 ? (
                                  <div className="mt-6 pl-8 space-y-4 border-l-2 border-slate-200 border-dashed ml-6 pt-2">
                                      {children.map(child => (
                                          <div key={child.id} className="relative">
                                               <div className="absolute -left-[34px] top-5 w-6 h-0.5 bg-slate-200 border-t border-dashed"></div>
                                               <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                                                   <div>
                                                       <div className="font-bold text-slate-700 text-sm">{child.name}</div>
                                                       <div className="text-xs text-slate-400">{child.type} • {child.serialNumber}</div>
                                                   </div>
                                                   <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">{child.status}</span>
                                               </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="mt-4 pl-8 text-sm text-slate-400 italic">No connected child assets.</div>
                              )}
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Warranty Status</h4>
                  <div className="text-center py-2">
                      <span className={`text-3xl font-bold ${warrantyDays > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {warrantyDays > 0 ? warrantyDays : 'Expired'}
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">{warrantyDays > 0 ? 'Days Remaining' : 'Warranty Expired'}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
                      <span className="text-slate-500">Expires:</span>
                      <span className="font-medium">{new Date(asset.warrantyExpiry).toLocaleDateString()}</span>
                  </div>
              </div>

              {/* Assignment Card */}
              <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Current Assignment</h4>
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {asset.assignedTo ? asset.assignedTo.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                          <div className="font-bold text-slate-800">{asset.assignedTo || 'Unassigned'}</div>
                          <div className="text-xs text-slate-500">Custodian</div>
                      </div>
                  </div>
                  <div className="bg-slate-50 rounded p-3 text-xs text-slate-600">
                      <div className="flex justify-between mb-1">
                          <span>Department:</span>
                          <span className="font-medium">{asset.departmentName}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Assigned Date:</span>
                          <span className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
