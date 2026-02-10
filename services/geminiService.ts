import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, Category, Priority, Sentiment, Asset, AnalyticsResponse, AssetCondition, Feedback, AssetReport } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a new ticket request to determine Category, Urgency, and Sentiment.
 */
export const analyzeNewTicket = async (title: string, description: string): Promise<any> => {
  try {
    const prompt = `
      You are an intelligent help desk assistant. Analyze the following ticket request.
      
      Request Title: "${title}"
      Request Description: "${description}"

      Tasks:
      1. Classify the Category (Technical Support, Finance, Sales, General Inquiry).
      2. Assess Urgency (Low, Medium, High, Critical).
      3. Detect Sentiment (Positive, Neutral, Frustrated, Angry).
      4. Suggest a brief, generic Knowledge Base topic that might help.

      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: Object.values(Category) },
            priority: { type: Type.STRING, enum: Object.values(Priority) },
            sentiment: { type: Type.STRING, enum: Object.values(Sentiment) },
            confidence: { type: Type.NUMBER },
            kbSuggestion: { type: Type.STRING }
          },
          required: ["category", "priority", "sentiment", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback default
    return {
      category: Category.GENERAL,
      priority: Priority.MEDIUM,
      sentiment: Sentiment.NEUTRAL,
      confidence: 0,
      kbSuggestion: "Contact Support"
    };
  }
};

/**
 * Predicts if the ticket is related to a specific asset owned by the user.
 */
export const predictLinkedAsset = async (description: string, userAssets: Asset[]): Promise<{ assetId: string | null, confidence: number, reasoning: string }> => {
    if (userAssets.length === 0) return { assetId: null, confidence: 0, reasoning: "No assets assigned." };

    try {
        // Need to pass model names instead of IDs for AI context
        const assetsContext = userAssets.map(a => `ID: ${a.id}, Name: ${a.name}, Serial: ${a.serialNumber}`).join('\n');
        
        const prompt = `
            User Description: "${description}"
            
            User's Assigned Assets:
            ${assetsContext}

            Task: Determine if the user is complaining about one of their assigned assets.
            If yes, return the Asset ID. If the description is vague or unrelated to hardware/software, return null.
            
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        assetId: { type: Type.STRING, nullable: true },
                        confidence: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["confidence", "reasoning"]
                }
            }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Asset Prediction Failed:", error);
        return { assetId: null, confidence: 0, reasoning: "Error" };
    }
}

/**
 * Generates Analytics & Business Intelligence based on natural language query.
 */
export const generateAnalyticsInsights = async (query: string, ticketStats: any): Promise<AnalyticsResponse> => {
    try {
        const statsContext = JSON.stringify(ticketStats);
        
        const prompt = `
            You are a Senior IT Operations Data Analyst.
            
            User Query: "${query}"
            
            Current Dataset Context:
            ${statsContext}

            Task: 
            1. Analyze the data to answer the user's question.
            2. Write a professional executive summary paragraph (narrative style).
            3. Determine a trend direction (UP, DOWN, STABLE).
            4. Generate data points for a simple bar/line chart relevant to the question.
            5. Suggest a strategic action.

            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        trend: { type: Type.STRING, enum: ['UP', 'DOWN', 'STABLE'] },
                        chartData: { 
                            type: Type.ARRAY, 
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.NUMBER }
                                }
                            }
                        },
                        suggestedAction: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Analytics Generation Failed:", error);
        return {
            summary: "Unable to generate insights at this time.",
            trend: 'STABLE',
            chartData: [],
            suggestedAction: "Check system logs."
        };
    }
}

/**
 * Evaluates Asset Health for Refresh Recommendations
 */
export const evaluateAssetHealth = async (asset: Asset, modelName: string): Promise<{ recommendation: string; score: number; justification: string }> => {
    try {
        const ageYears = (Date.now() - asset.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
        const warrantyStatus = asset.warrantyExpiry < Date.now() ? "Expired" : "Active";
        
        const prompt = `
            Analyze asset ${asset.id} (${modelName}).
            Age: ${ageYears.toFixed(1)} years.
            Condition: ${asset.condition}.
            Warranty: ${warrantyStatus}.
            Purchase Cost: $${asset.purchaseCost}.
            
            Should this asset be replaced? Provide a recommendation with a confidence score (0-100) and financial justification.
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendation: { type: Type.STRING, enum: ['Keep', 'Refresh', 'Review'] },
                        score: { type: Type.NUMBER },
                        justification: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { recommendation: "Review", score: 0, justification: "AI Analysis failed" };
    }
}

/**
 * Analyze Feedback for Coaching
 */
export const analyzeCustomerFeedback = async (ratings: any, comment: string): Promise<{ sentimentScore: number, coachingTips: string, themes: string[] }> => {
    try {
        const prompt = `
            Analyze this user feedback survey.
            Ratings: ${JSON.stringify(ratings)}
            Comment: "${comment}"

            Identify:
            1. Sentiment Score (0-100)
            2. Coaching tips for the agent.
            3. Key themes (e.g. "Slow Response", "Knowledgeable", "Rude").
            
            Return JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentimentScore: { type: Type.NUMBER },
                        coachingTips: { type: Type.STRING },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { sentimentScore: 50, coachingTips: "Feedback recorded.", themes: [] };
    }
}

/**
 * Generate Realistic Mock Diagnostic Report
 */
export const generateAssetDiagnostic = async (asset: Asset, modelName: string): Promise<Partial<AssetReport>> => {
    try {
         const ageMonths = Math.floor((Date.now() - asset.purchaseDate) / (1000 * 60 * 60 * 24 * 30));
         const prompt = `
            Generate a realistic, detailed mock diagnostic report for a ${modelName} that is ${ageMonths} months old.
            Asset Condition: ${asset.condition}.
            
            Create 3-5 technical metrics (e.g. Battery Cycle Count, CPU Idle Temp, SSD Health, Free Space).
            Provide 3 actionable maintenance recommendations.
            Give an overall health score (0-100).
            
            Return JSON matching the schema.
         `;
         
         const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         overallHealthScore: { type: Type.NUMBER },
                         metrics: { 
                             type: Type.ARRAY, 
                             items: { 
                                 type: Type.OBJECT,
                                 properties: {
                                     name: { type: Type.STRING },
                                     value: { type: Type.STRING },
                                     status: { type: Type.STRING, enum: ['OK', 'WARNING', 'CRITICAL'] }
                                 }
                             }
                         },
                         aiRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                     }
                 }
             }
         });
         
         return JSON.parse(response.text || '{}');
    } catch (e) {
        return { overallHealthScore: 0, metrics: [], aiRecommendations: [] };
    }
}

/**
 * Suggests Procurement Models based on Role/Dept
 */
export const recommendProcurement = async (role: string, department: string): Promise<{ models: string[]; reasoning: string }> => {
     try {
        const prompt = `
            User Role: ${role}
            Department: ${department}
            
            Recommend 3 suitable standard laptop/hardware models for this user profile based on industry standards.
            Return JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        models: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reasoning: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
     } catch (e) {
         return { models: [], reasoning: "Failed" };
     }
}

export const analyzeIntakeRisk = async (ticket: Partial<Ticket>): Promise<string> => {
    try {
         const prompt = `
            Analyze this new ticket intake for operational risks.
            Title: ${ticket.title}
            Description: ${ticket.description}
            Category: ${ticket.category}
            Identify if this matches any Critical Incident patterns. If safe, return "Low Risk".
         `;
         const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
         return response.text || "Assessment pending";
    } catch (e) { return "Assessment failed"; }
}

export const generateTicketSummary = async (ticket: Ticket): Promise<string> => {
    try {
      const conversationText = ticket.messages.map(m => `${m.senderName}: ${m.content}`).join('\n');
      const prompt = `Summarize this ticket history.\nTitle: ${ticket.title}\nConversation:\n${conversationText}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return response.text || "No summary available.";
    } catch (error) { return "Error generating summary."; }
  };
  
export const generateAgentDraft = async (ticket: Ticket): Promise<string> => {
    try {
      const conversationText = ticket.messages.map(m => `${m.senderName}: ${m.content}`).join('\n');
      const prompt = `Draft a support response.\nCategory: ${ticket.category}\nHistory:\n${conversationText}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
      return response.text || "";
    } catch (error) { return "Error generating draft."; }
};
  
export const analyzeRootCause = async (ticket: Ticket, linkedAsset?: Asset): Promise<string> => {
      try {
          let context = `Title: ${ticket.title}\nDescription: ${ticket.description}`;
          if (linkedAsset) context += `\nAsset Context: ${linkedAsset.name}`;
          const prompt = `Analyze root cause.\nContext:\n${context}`;
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
          return response.text || "No analysis available.";
        } catch (error) { return "Analysis failed."; }
}
