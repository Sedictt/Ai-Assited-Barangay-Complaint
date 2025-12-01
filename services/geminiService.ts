import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysis, UrgencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    priorityScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating prioritization order. 100 is highest priority.",
    },
    urgencyLevel: {
      type: Type.STRING,
      enum: [UrgencyLevel.LOW, UrgencyLevel.MEDIUM, UrgencyLevel.HIGH, UrgencyLevel.CRITICAL],
      description: "The classification of urgency based on threat to life, property, or public order.",
    },
    impactAnalysis: {
      type: Type.STRING,
      description: "A concise summary (max 2 sentences) of the potential impact if not addressed.",
    },
    suggestedAction: {
      type: Type.STRING,
      description: "Recommended immediate action for the barangay officials.",
    },
    estimatedResourceIntensity: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Estimate of manpower or resources needed to resolve this.",
    },
    categoryCorrection: {
      type: Type.STRING,
      description: "If the user categorized it wrong, suggest the correct standard category.",
    },
    confidenceScore: {
      type: Type.INTEGER,
      description: "Confidence level (0-100) of the analysis based on input clarity and detail.",
    },
    isTroll: {
      type: Type.BOOLEAN,
      description: "True if the complaint appears to be a prank, spam, or nonsensical troll submission.",
    },
    trollAnalysis: {
      type: Type.STRING,
      description: "Explanation of why this is flagged as a troll report, or null if not.",
    },
  },
  required: ["priorityScore", "urgencyLevel", "impactAnalysis", "suggestedAction", "estimatedResourceIntensity", "confidenceScore", "isTroll"],
};

export const analyzeComplaint = async (
  title: string,
  description: string,
  location: string,
  category: string
): Promise<AIAnalysis> => {
  try {
    const prompt = `
      You are an AI assistant for Barangay Maysan, Valenzuela City. Your job is to prioritize citizen complaints to help officials manage resources efficiently.
      
      Analyze the following complaint:
      Title: ${title}
      Description: ${description}
      Location: ${location}
      User Selected Category: ${category}

      Context for Barangay Maysan:
      - Flooding and drainage are common issues.
      - Peace and order (noise, fights) are high priority at night.
      - Public health (garbage, sanitation) is critical.
      - Check for signs of prank/troll submissions (e.g., unrealistic claims, nonsensical text, profanity without substance).
      
      Output strictly in JSON format based on the provided schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3, // Low temperature for consistent, analytical results
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback if AI fails
    return {
      priorityScore: 50,
      urgencyLevel: UrgencyLevel.MEDIUM,
      impactAnalysis: "AI Analysis unavailable. Manual review required.",
      suggestedAction: "Review complaint manually.",
      estimatedResourceIntensity: "MEDIUM",
      confidenceScore: 0,
      isTroll: false,
      trollAnalysis: "Analysis failed",
    };
  }
};

export const generateAIResponse = async (
  userMessage: string,
  context: string
): Promise<string> => {
  try {
    const prompt = `
      ${context}

      User Question: ${userMessage}
      
      Provide a helpful, concise, and friendly response.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7, // Higher temperature for more natural conversation
      },
    });

    return response.text || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("AI Chat failed:", error);
    return "I'm having trouble connecting to the server. Please try again later.";
  }
};