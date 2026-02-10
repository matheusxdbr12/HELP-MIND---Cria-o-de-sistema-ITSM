import React, { useState, useEffect } from 'react';
import { analyzeNewTicket, predictLinkedAsset, analyzeIntakeRisk } from '../services/geminiService';
import { addTicket, getUserAssets, getDynamicFieldsForCategory } from '../services/mockStore';
import { Category, Priority, Sentiment, Ticket, TicketStatus, Asset } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TicketFormProps {
  onTicketCreated: () => void;
  currentUser: any;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onTicketCreated, currentUser }) => {
  const { t } = useLanguage();
  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    category: Category;
    priority: Priority;
    confidence: number;
    kbSuggestion?: string;
  } | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<string>('');
  
  const [suggestedAsset, setSuggestedAsset] = useState<Asset | null>(null);
  const userAssets = getUserAssets(currentUser.id);

  // Step 1: Real-time Analysis
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 5 && description.length > 10 && step === 1) {
        setIsAnalyzing(true);
        const [ticketAnalysis, assetPrediction] = await Promise.all([
            analyzeNewTicket(title, description),
            predictLinkedAsset(description, userAssets)
        ]);

        setAnalysis(ticketAnalysis);
        
        if (assetPrediction.assetId) {
            const found = userAssets.find(a => a.id === assetPrediction.assetId);
            setSuggestedAsset(found || null);
        }
        setIsAnalyzing(false);
      }
    }, 1500); 

    return () => clearTimeout(timer);
  }, [title, description, userAssets, step]);

  const handleNextStep = async () => {
    if (step === 1 && analysis) {
        // Trigger risk assessment before moving deeper
        const risk = await analyzeIntakeRisk({ title, description, category: analysis.category });
        setRiskAssessment(risk);
        setStep(2);
    } else if (step === 2) {
        setStep(3);
    }
  };

  const handleSubmit = () => {
    const newTicket: Ticket = {
      id: `T-${Math.floor(Math.random() * 10000)}`,
      title,
      description,
      category: analysis?.category || Category.UNCLASSIFIED,
      priority: analysis?.priority || Priority.MEDIUM,
      sentiment: (analysis as any)?.sentiment || Sentiment.NEUTRAL,
      status: TicketStatus.OPEN,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customerId: currentUser.id,
      linkedAssetId: suggestedAsset?.id,
      customFields: customFields,
      messages: [{
        id: `m-${Date.now()}`,
        ticketId: '',
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: description,
        timestamp: Date.now(),
        isInternal: false
      }],
      aiAnalysis: {
        confidence: analysis?.confidence || 0,
        riskAssessment: riskAssessment
      },
      // SLA fields initialized with default values; calculated in store
      slaTarget: 0,
      slaStatus: 'ON_TRACK',
      slaTier: 'Standard',
      demandFactorApplied: 1.0
    };
    newTicket.messages[0].ticketId = newTicket.id;
    
    addTicket(newTicket);
    onTicketCreated();
  };

  const renderStep1 = () => (
      <div className="space-y-6 animate-fade-in">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('howCanWeHelp')}</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
              placeholder={t('placeholderTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('details')}</label>
            <textarea
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder={t('describeIssue')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
        </div>

        {/* Real-time Insights */}
        {isAnalyzing ? (
             <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 p-3 rounded-lg">
                 <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm font-medium">{t('analyzing')}</span>
             </div>
        ) : analysis && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex justify-between items-center">
                <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">{t('categoryDetected')}</span>
                    <p className="text-indigo-700 font-bold">{analysis.category}</p>
                </div>
                 {suggestedAsset && (
                     <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase font-bold">{t('linkedAsset')}</span>
                        <p className="text-slate-800 font-medium text-sm">{suggestedAsset.name}</p>
                     </div>
                 )}
            </div>
        )}

        <div className="flex justify-end pt-4">
            <button 
                onClick={handleNextStep}
                disabled={!title || !description || isAnalyzing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                {t('continue')}
            </button>
        </div>
      </div>
  );

  const renderStep2 = () => {
      const fields = analysis ? getDynamicFieldsForCategory(analysis.category) : [];
      
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <h3 className="text-blue-800 font-bold text-sm mb-1">{t('additionalInfo')}</h3>
                  <p className="text-blue-600 text-xs">{t('additionalInfoDesc')} <span className="font-bold">({analysis?.category})</span>.</p>
              </div>

              {fields.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                      {fields.map(field => (
                          <div key={field.id}>
                              <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                              {field.type === 'textarea' ? (
                                  <textarea 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500"
                                    value={customFields[field.id] || ''}
                                    onChange={(e) => setCustomFields({...customFields, [field.id]: e.target.value})}
                                    placeholder={field.placeholder}
                                  />
                              ) : field.type === 'select' ? (
                                  <select 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500"
                                    value={customFields[field.id] || ''}
                                    onChange={(e) => setCustomFields({...customFields, [field.id]: e.target.value})}
                                  >
                                      <option value="">Select option...</option>
                                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                              ) : (
                                  <input 
                                    type={field.type}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500"
                                    value={customFields[field.id] || ''}
                                    onChange={(e) => setCustomFields({...customFields, [field.id]: e.target.value})}
                                    placeholder={field.placeholder}
                                  />
                              )}
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-8 text-slate-500 italic">No additional details needed for this category.</div>
              )}

              <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700">{t('back')}</button>
                  <button onClick={handleNextStep} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('review')}</button>
              </div>
          </div>
      )
  };

  const renderStep3 = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">{t('reviewTicket')}</h3>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">{t('subject')}</span>
                      <p className="text-slate-900 font-medium">{title}</p>
                  </div>
                  <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">{t('description')}</span>
                      <p className="text-slate-700 text-sm">{description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <span className="text-xs text-slate-500 uppercase font-bold">{t('category')}</span>
                          <p className="text-indigo-600 font-bold">{analysis?.category}</p>
                      </div>
                      <div>
                          <span className="text-xs text-slate-500 uppercase font-bold">{t('priority')}</span>
                          <p className={`font-bold ${analysis?.priority === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>{analysis?.priority}</p>
                      </div>
                  </div>
                  {Object.keys(customFields).length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">Additional Details</span>
                          <dl className="grid grid-cols-1 gap-2">
                              {Object.entries(customFields).map(([key, val]) => (
                                  <div key={key} className="flex justify-between text-sm">
                                      <dt className="text-slate-600">{key}:</dt>
                                      <dd className="font-medium text-slate-900">{val}</dd>
                                  </div>
                              ))}
                          </dl>
                      </div>
                  )}
              </div>
          </div>

          {/* Risk Alert */}
          {riskAssessment && riskAssessment.includes('Critical') && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                      <h4 className="text-sm font-bold text-red-800">High Priority Pattern Detected</h4>
                      <p className="text-xs text-red-700 mt-1">{riskAssessment}</p>
                  </div>
              </div>
          )}

          <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700">{t('back')}</button>
              <button onClick={handleSubmit} className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm">
                  {t('createTicket')}
              </button>
          </div>
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center justify-between px-8">
          {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {s}
                  </div>
                  <span className="text-xs text-slate-500 mt-2 font-medium">
                      {s === 1 ? 'Context' : s === 2 ? 'Details' : 'Review'}
                  </span>
              </div>
          ))}
          <div className="absolute top-8 left-0 w-full h-0.5 bg-slate-200 -z-0 max-w-2xl mx-auto right-0"></div> 
          <div 
            className="absolute top-8 left-0 h-0.5 bg-indigo-600 -z-0 max-w-2xl mx-auto right-0 transition-all duration-500" 
            style={{ width: `${(step - 1) * 50}%` }} // Simplified progress bar logic
          ></div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {step === 1 ? t('howCanWeHelp') : step === 2 ? 'Let\'s get specifics' : 'Ready to submit?'}
          </h2>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
      </div>
    </div>
  );
};