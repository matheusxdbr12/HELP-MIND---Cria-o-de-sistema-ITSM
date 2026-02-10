import React, { useState } from 'react';
import { generateAnalyticsInsights } from '../services/geminiService';
import { getTickets } from '../services/mockStore';
import { AnalyticsResponse } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalyticsResponse | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    // In a real app, we would aggregate data on the backend. 
    // Here we pass a raw count summary to Gemini to simulate the "Database"
    const tickets = getTickets();
    const stats = {
        totalTickets: tickets.length,
        byPriority: tickets.reduce((acc: any, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {}),
        byCategory: tickets.reduce((acc: any, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {}),
        avgResolutionHours: 4.5, // Mock metric
        slaBreachRate: "12%"
    };

    const result = await generateAnalyticsInsights(query, stats);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Insight Query Engine</h2>
          <p className="text-slate-500">Ask questions about your support operations in plain English.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
          {/* Output Area */}
          <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
              {!report && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      <p className="text-lg">Try asking: "How is our SLA performance this week?"</p>
                  </div>
              )}

              {loading && (
                  <div className="h-full flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-indigo-600 font-medium animate-pulse">Analyzing Data...</p>
                  </div>
              )}

              {report && (
                  <div className="space-y-8 animate-fade-in">
                      {/* Executive Summary */}
                      <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-2">Executive Summary</h3>
                          <p className="text-slate-800 leading-relaxed text-lg">{report.summary}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Trend Card */}
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                              <span className="text-slate-500 text-sm font-bold uppercase mb-2">Trend Analysis</span>
                              {report.trend === 'UP' ? (
                                  <span className="text-green-500 flex items-center text-4xl font-bold">
                                      <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                      Upward
                                  </span>
                              ) : report.trend === 'DOWN' ? (
                                  <span className="text-red-500 flex items-center text-4xl font-bold">
                                      <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                      Downward
                                  </span>
                              ) : (
                                  <span className="text-blue-500 flex items-center text-4xl font-bold">Stable</span>
                              )}
                          </div>

                          {/* Chart Placeholder (Simulated CSS Bar Chart) */}
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                              <h4 className="text-slate-800 font-bold mb-4">Visual Breakdown</h4>
                              <div className="h-40 flex items-end justify-around space-x-2">
                                  {report.chartData.map((data, i) => (
                                      <div key={i} className="flex flex-col items-center flex-1 group">
                                          <div 
                                            className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-all relative" 
                                            style={{ height: `${(data.value / Math.max(...report.chartData.map(d=>d.value))) * 100}%` }}
                                          >
                                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  {data.value}
                                              </div>
                                          </div>
                                          <span className="text-xs text-slate-500 mt-2 truncate max-w-[60px]">{data.label}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Prescriptive Action */}
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start space-x-4">
                          <div className="bg-emerald-100 p-2 rounded-full">
                              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <div>
                              <h4 className="text-emerald-800 font-bold text-sm">Recommended Strategic Action</h4>
                              <p className="text-emerald-700 mt-1">{report.suggestedAction}</p>
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-200">
              <form onSubmit={handleQuery} className="relative">
                  <input 
                      type="text" 
                      className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg shadow-inner transition-all"
                      placeholder="Ask insights..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                  />
                  <button 
                      type="submit"
                      disabled={loading || !query}
                      className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};
