import React, { useState, useEffect, useRef } from 'react';
import { Ticket, User, Message, TicketStatus, Priority, Asset, AgentScore, Feedback, AppPermission } from '../types';
import { generateTicketSummary, generateAgentDraft, analyzeRootCause, analyzeCustomerFeedback } from '../services/geminiService';
import { addMessageToTicket, updateTicketAnalysis, updateTicketStatus, getAssetById, linkAssetToTicket, getAssets, calculateBestAgent, updateTicketAssignee, getAssetWithDetails, submitFeedback, getTicketFeedback } from '../services/mockStore';
import { formatTimeRemaining, getSLAStatus } from '../services/slaService';
import { useAuth } from '../context/AuthContext';

interface TicketDetailProps {
  ticket: Ticket;
  currentUser: User;
  onBack: () => void;
  onUpdate: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, currentUser, onBack, onUpdate }) => {
  const { hasPermission } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');
  const [summary, setSummary] = useState(ticket.aiAnalysis?.summary || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [draft, setDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [rootCause, setRootCause] = useState(ticket.aiAnalysis?.rootCauseAnalysis || '');
  const [isAnalyzingRoot, setIsAnalyzingRoot] = useState(false);
  
  const [linkedAsset, setLinkedAsset] = useState<Asset | undefined>(ticket.linkedAssetId ? getAssetById(ticket.linkedAssetId) : undefined);
  const [isLinking, setIsLinking] = useState(false);
  
  const assetDetails = linkedAsset ? getAssetWithDetails(linkedAsset) : undefined;
  
  // Intelligent Assignment State
  const [agentScores, setAgentScores] = useState<AgentScore[]>([]);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [ratings, setRatings] = useState({ overall: 0, technical: 0, courtesy: 0, timeliness: 0 });
  const [feedbackComment, setFeedbackComment] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<Feedback | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const slaStatus = getSLAStatus(ticket);
  const timeRemaining = formatTimeRemaining(ticket.slaTarget);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setLinkedAsset(ticket.linkedAssetId ? getAssetById(ticket.linkedAssetId) : undefined);
    setExistingFeedback(getTicketFeedback(ticket.id));
    
    // Calculate agent scores whenever ticket opens/changes
    if (hasPermission(AppPermission.MANAGE_TICKETS)) {
        setAgentScores(calculateBestAgent(ticket));
    }
  }, [ticket, ticket.linkedAssetId, currentUser.role, hasPermission]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `m-${Date.now()}`,
      ticketId: ticket.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      timestamp: Date.now(),
      isInternal: false
    };

    addMessageToTicket(ticket.id, message);
    setNewMessage('');
    onUpdate();
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const result = await generateTicketSummary(ticket);
    setSummary(result);
    updateTicketAnalysis(ticket.id, { summary: result });
    setIsSummarizing(false);
  };

  const handleGenerateDraft = async () => {
    setIsDrafting(true);
    const result = await generateAgentDraft(ticket);
    setDraft(result);
    setIsDrafting(false);
  };

  const handleApplyDraft = () => {
    setNewMessage(draft);
    setDraft('');
  };

  const handleRootCause = async () => {
      setIsAnalyzingRoot(true);
      const result = await analyzeRootCause(ticket, linkedAsset);
      setRootCause(result);
      updateTicketAnalysis(ticket.id, { rootCauseAnalysis: result });
      setIsAnalyzingRoot(false);
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateTicketStatus(ticket.id, e.target.value as TicketStatus);
      onUpdate();
  }

  const handleAssetLink = (assetId: string) => {
      linkAssetToTicket(ticket.id, assetId);
      setLinkedAsset(getAssetById(assetId));
      setIsLinking(false);
      onUpdate();
  }

  const handleAssignAgent = (agentId: string) => {
      updateTicketAssignee(ticket.id, agentId);
      onUpdate();
  }

  const handleRequestVerification = () => {
      // Agent marks as RESOLVED, waiting for user
      updateTicketStatus(ticket.id, TicketStatus.RESOLVED);
      addMessageToTicket(ticket.id, {
          id: `m-sys-${Date.now()}`,
          ticketId: ticket.id,
          senderId: 'system',
          senderName: 'System',
          content: 'Agent has marked this ticket as resolved. Waiting for user verification.',
          timestamp: Date.now(),
          isInternal: true
      });
      onUpdate();
  }

  const handleSubmitFeedback = async () => {
      const analysis = await analyzeCustomerFeedback(ratings, feedbackComment);
      const feedback: Feedback = {
          id: `f-${Date.now()}`,
          ticketId: ticket.id,
          userId: currentUser.id,
          timestamp: Date.now(),
          ratings,
          comment: feedbackComment,
          aiAnalysis: analysis
      };
      
      submitFeedback(feedback);
      setShowFeedbackModal(false);
      onUpdate();
  };

  const handleReopen = () => {
      updateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
      addMessageToTicket(ticket.id, {
        id: `m-${Date.now()}`,
        ticketId: ticket.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: "I am reopening this ticket because the issue persists.",
        timestamp: Date.now(),
        isInternal: false
      });
      onUpdate();
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 relative">
      {/* Feedback Modal */}
      {showFeedbackModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all scale-100">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Issue Resolved!</h2>
                      <p className="text-slate-500">Please rate your support experience to close this ticket.</p>
                  </div>

                  <div className="space-y-4 mb-6">
                      {[
                          { key: 'overall', label: 'Overall Satisfaction' },
                          { key: 'technical', label: 'Technical Expertise' },
                          { key: 'courtesy', label: 'Agent Courtesy' },
                          { key: 'timeliness', label: 'Resolution Time' }
                      ].map((metric) => (
                          <div key={metric.key} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                              <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button 
                                        key={star}
                                        type="button"
                                        onClick={() => setRatings({...ratings, [metric.key]: star * 2})} // Convert 1-5 to 1-10 scale mostly
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                            (ratings[metric.key as keyof typeof ratings] / 2) >= star 
                                            ? 'bg-yellow-400 text-white' 
                                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                        }`}
                                      >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Comments (Optional)</label>
                      <textarea 
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows={3}
                        placeholder="What did we do well? What can we improve?"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                      />
                  </div>

                  <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowFeedbackModal(false)}
                        className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleSubmitFeedback}
                        disabled={ratings.overall === 0}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                      >
                          Submit & Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{ticket.title}</h1>
              <p className="text-xs text-slate-500 font-mono">#{ticket.id} • {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             {hasPermission(AppPermission.MANAGE_TICKETS) && (
                 <select 
                    value={ticket.status} 
                    onChange={handleStatusChange}
                    className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-1.5"
                    disabled={ticket.status === TicketStatus.CLOSED}
                 >
                     {Object.values(TicketStatus).map(s => (
                         <option key={s} value={s}>{s}</option>
                     ))}
                 </select>
             )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              ticket.priority === Priority.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* SLA Banner */}
        {ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED && (
            <div className={`px-6 py-2 flex justify-between items-center text-sm font-medium ${
                slaStatus === 'BREACHED' ? 'bg-red-100 text-red-800 border-b border-red-200' : 
                slaStatus === 'AT_RISK' ? 'bg-orange-100 text-orange-800 border-b border-orange-200' : 
                'bg-blue-50 text-blue-800 border-b border-blue-100'
            }`}>
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>SLA Timer: {ticket.slaTier} Tier</span>
                </div>
                <div>
                    {slaStatus === 'BREACHED' ? (
                        <span className="font-bold uppercase tracking-wide flex items-center">
                            Breached by {timeRemaining.replace('-', '')}
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </span>
                    ) : (
                        <span>Due in <span className="font-bold font-mono">{timeRemaining}</span></span>
                    )}
                </div>
            </div>
        )}

        {/* Resolution Verification Banner (Customer View) */}
        {ticket.status === TicketStatus.RESOLVED && !hasPermission(AppPermission.MANAGE_TICKETS) && (
            <div className="bg-green-50 border-b border-green-200 p-4 flex justify-between items-center animate-fade-in">
                <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-green-900">Agent marked this issue as resolved</h3>
                        <p className="text-xs text-green-700">Please confirm if your issue is fixed to close the ticket.</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleReopen}
                        className="px-4 py-2 bg-white text-slate-700 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Issue Persists (Reopen)
                    </button>
                    <button 
                        onClick={() => setShowFeedbackModal(true)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-sm"
                    >
                        Confirm Resolution
                    </button>
                </div>
            </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {ticket.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isAgent = msg.senderId.startsWith('agent');
            const isSystem = msg.senderId === 'system';
            
            if (isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">{msg.content}</span>
                    </div>
                )
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : isAgent 
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      : 'bg-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  <div className="flex justify-between items-baseline mb-1 space-x-4">
                    <span className={`text-xs font-bold ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.senderName}</span>
                    <span className={`text-[10px] opacity-70`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        {ticket.status !== TicketStatus.CLOSED && (
            <div className="p-4 bg-white border-t border-slate-200">
                {draft && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-start animate-fade-in">
                        <div>
                            <span className="text-xs font-bold text-yellow-700 uppercase">AI Draft Suggestion</span>
                            <p className="text-sm text-yellow-900 mt-1 whitespace-pre-wrap">{draft}</p>
                        </div>
                        <div className="flex space-x-2 shrink-0 ml-4">
                            <button onClick={handleApplyDraft} className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded">Use</button>
                            <button onClick={() => setDraft('')} className="text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1">Discard</button>
                        </div>
                    </div>
                )}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-24 outline-none transition-all"
                />
                <div className="flex flex-col gap-2">
                    <button
                        type="submit"
                        className="flex-1 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                    {hasPermission(AppPermission.MANAGE_TICKETS) && (
                         <>
                            <button
                                type="button"
                                onClick={handleGenerateDraft}
                                disabled={isDrafting}
                                className="flex-1 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                                title="Generate AI Draft"
                            >
                                {isDrafting ? (
                                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                )}
                            </button>
                            {ticket.status !== TicketStatus.RESOLVED && (
                                <button
                                    type="button"
                                    onClick={handleRequestVerification}
                                    className="flex-1 px-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                                    title="Mark Resolved"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            )}
                         </>
                    )}
                </div>
              </form>
            </div>
        )}

        {/* Closed Ticket Feedback View (For Agents) */}
        {ticket.status === TicketStatus.CLOSED && existingFeedback && hasPermission(AppPermission.MANAGE_TICKETS) && (
             <div className="p-6 bg-slate-50 border-t border-slate-200">
                 <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                         <h3 className="font-bold text-slate-800">Customer Feedback</h3>
                         <span className="text-xs text-slate-500">{new Date(existingFeedback.timestamp).toLocaleDateString()}</span>
                     </div>
                     <div className="flex space-x-6 mb-4">
                         <div className="text-center">
                             <div className="text-2xl font-bold text-indigo-600">{existingFeedback.ratings.overall}/10</div>
                             <div className="text-xs text-slate-500 uppercase">Overall</div>
                         </div>
                         <div className="text-center">
                             <div className="text-xl font-bold text-slate-700">{existingFeedback.ratings.technical}/10</div>
                             <div className="text-xs text-slate-500 uppercase">Tech</div>
                         </div>
                         <div className="text-center">
                             <div className="text-xl font-bold text-slate-700">{existingFeedback.ratings.courtesy}/10</div>
                             <div className="text-xs text-slate-500 uppercase">Courtesy</div>
                         </div>
                     </div>
                     {existingFeedback.comment && (
                         <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 italic mb-4">"{existingFeedback.comment}"</div>
                     )}
                     
                     {existingFeedback.aiAnalysis && (
                         <div className="bg-purple-50 p-3 rounded border border-purple-100">
                             <div className="flex items-center space-x-2 mb-1">
                                 <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                 <span className="text-xs font-bold text-purple-700 uppercase">AI Coaching Tip</span>
                             </div>
                             <p className="text-sm text-purple-900">{existingFeedback.aiAnalysis.coachingTips}</p>
                         </div>
                     )}
                 </div>
             </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-1">
        
        {/* Intelligent Assignment Card (New) */}
        {hasPermission(AppPermission.MANAGE_TICKETS) && ticket.status !== TicketStatus.CLOSED && (
             <div className="bg-white p-5 rounded-xl shadow border border-indigo-100 ring-2 ring-indigo-50">
                 <div className="flex items-center space-x-2 mb-4">
                     <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                     <h3 className="font-bold text-slate-800">Smart Assignment</h3>
                 </div>
                 
                 <div className="space-y-3">
                     {agentScores.slice(0, 3).map((score, idx) => (
                         <div key={score.agent.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                             <div className="flex justify-between items-center mb-2">
                                 <div className="flex items-center space-x-2">
                                     <div className="text-xs font-bold text-slate-700">{score.agent.name.split(' ')[0]}</div>
                                     {idx === 0 && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Best Fit</span>}
                                 </div>
                                 <div className="text-sm font-bold text-indigo-600">{score.totalScore}%</div>
                             </div>
                             
                             {/* Mini Breakdown Graph */}
                             <div className="flex space-x-1 h-1.5 mb-3">
                                 <div className="bg-blue-400 rounded-sm" style={{ width: `${score.breakdown.skillMatch}%` }} title="Skill"></div>
                                 <div className="bg-green-400 rounded-sm" style={{ width: `${score.breakdown.history}%` }} title="History"></div>
                                 <div className="bg-yellow-400 rounded-sm" style={{ width: `${score.breakdown.workload}%` }} title="Capacity"></div>
                             </div>

                             {ticket.assignedAgentId !== score.agent.id && (
                                 <button 
                                    onClick={() => handleAssignAgent(score.agent.id)}
                                    className="w-full py-1.5 text-xs bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 rounded shadow-sm transition-colors"
                                 >
                                     Assign
                                 </button>
                             )}
                             {ticket.assignedAgentId === score.agent.id && (
                                 <div className="w-full py-1.5 text-xs bg-indigo-100 text-indigo-700 text-center rounded font-medium">Assigned</div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {/* Linked Asset Card */}
        <div className="bg-white p-5 rounded-xl shadow border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Linked Asset</h3>
                {hasPermission(AppPermission.MANAGE_TICKETS) && ticket.status !== TicketStatus.CLOSED && (
                    <button onClick={() => setIsLinking(!isLinking)} className="text-xs text-indigo-600 font-medium hover:text-indigo-800">
                        {linkedAsset ? 'Change' : 'Link'}
                    </button>
                )}
            </div>

            {isLinking && (
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">Select Asset to Link:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {getAssets().map(asset => (
                            <button 
                                key={asset.id} 
                                onClick={() => handleAssetLink(asset.id)}
                                className="w-full text-left text-xs p-2 hover:bg-slate-200 rounded truncate"
                            >
                                {asset.name} ({getAssetWithDetails(asset).modelName})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {assetDetails ? (
                <div className="group relative">
                    <div className="flex items-start space-x-3 mb-3">
                         {assetDetails.modelImage ? (
                             <img src={assetDetails.modelImage} className="w-12 h-12 rounded bg-slate-100 object-cover" alt="" />
                         ) : (
                             <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                             </div>
                         )}
                         <div>
                             <p className="text-sm font-bold text-slate-800 leading-tight">{assetDetails.modelName}</p>
                             <p className="text-xs text-slate-500 mt-1">Serial: {assetDetails.serialNumber}</p>
                         </div>
                    </div>
                    {/* Specs Teaser */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        {assetDetails.specs && Object.entries(assetDetails.specs).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="flex justify-between py-0.5">
                                <span className="opacity-70">{k}</span>
                                <span className="font-medium">{v}</span>
                            </div>
                        ))}
                    </div>
                    {/* Warranty Badge */}
                    <div className={`mt-2 text-xs font-bold ${
                        (assetDetails.warrantyExpiry - Date.now()) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                        {(assetDetails.warrantyExpiry - Date.now()) < 0 ? 'Warranty Expired' : 'Warranty Active'}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-slate-300 rounded-lg">
                    No asset linked to this ticket.
                </div>
            )}
        </div>

        {/* Ticket Details Card */}
        <div className="bg-white p-5 rounded-xl shadow border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Ticket Details</h3>
            <div className="space-y-4 text-sm">
                <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wide">Customer</span>
                    <span className="font-medium text-slate-900">{ticket.customerId}</span>
                </div>
                 <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wide">Category</span>
                    <span className="font-medium text-slate-900">{ticket.category}</span>
                </div>
                <div>
                     <span className="text-slate-500 block text-xs uppercase tracking-wide">Sentiment Analysis</span>
                     <div className="flex items-center mt-1">
                         <div className={`w-2 h-2 rounded-full mr-2 ${
                             ticket.sentiment === 'Positive' ? 'bg-green-500' :
                             ticket.sentiment === 'Frustrated' ? 'bg-red-500' : 'bg-gray-400'
                         }`}></div>
                         <span className="font-medium text-slate-800">{ticket.sentiment}</span>
                     </div>
                </div>
                {/* Dynamic Fields Display */}
                {ticket.customFields && Object.keys(ticket.customFields).length > 0 && (
                    <div className="pt-2 border-t border-slate-100 mt-2">
                        {Object.entries(ticket.customFields).map(([k, v]) => (
                            <div key={k} className="mt-2">
                                <span className="text-slate-500 block text-xs uppercase tracking-wide">{k.replace(/_/g, ' ')}</span>
                                <span className="font-medium text-slate-900">{v}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* AI Tools Panel (Agent Only) */}
        {hasPermission(AppPermission.MANAGE_TICKETS) && ticket.status !== TicketStatus.CLOSED && (
            <div className="bg-white p-5 rounded-xl shadow border border-slate-200 flex-1 overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <h3 className="font-bold text-slate-800">Agent Copilot</h3>
                </div>

                {/* Summarization */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Context Summary</h4>
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={isSummarizing}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            {isSummarizing ? 'Generating...' : 'Refresh'}
                        </button>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[60px]">
                        {summary || <span className="text-slate-400 italic">No summary generated yet.</span>}
                    </div>
                </div>

                {/* Root Cause Analysis (Technical only) */}
                {ticket.category === 'Technical Support' && (
                     <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-bold text-slate-500 uppercase">Root Cause Analysis</h4>
                             <button 
                                 onClick={handleRootCause}
                                 disabled={isAnalyzingRoot}
                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                             >
                                 {isAnalyzingRoot ? 'Analyzing...' : 'Analyze'}
                             </button>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                             {rootCause ? rootCause : (
                                 <span className="text-slate-400 italic">
                                     {assetDetails 
                                        ? "Click analyze to run diagnostics on " + assetDetails.modelName 
                                        : "Click analyze to find potential causes."}
                                 </span>
                             )}
                         </div>
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};