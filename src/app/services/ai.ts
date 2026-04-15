import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

export interface ResumeAnalysis {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    formatting: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillsMatch: { skill: string; match: number }[];
  careerPath: string;
  jobMatches: { role: string; match: number; description: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  async analyzeResume(text: string): Promise<ResumeAnalysis> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following resume text and provide a detailed structured analysis in JSON format.
      
      Resume Text:
      ${text}
      
      The analysis should include:
      - A score from 0-100.
      - A breakdown of the score into three categories (0-100 each): skills, experience, and formatting.
      - A brief professional summary.
      - Top 3 strengths.
      - Top 3 areas for improvement (weaknesses).
      - 3 actionable recommendations.
      - A list of key skills found and their match percentage (0-100) relative to modern industry standards.
      - A suggested career path or next logical role.
      - Top 3 potential job roles the candidate is a good fit for, with a match percentage and brief reason.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                skills: { type: Type.NUMBER },
                experience: { type: Type.NUMBER },
                formatting: { type: Type.NUMBER }
              },
              required: ["skills", "experience", "formatting"]
            },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsMatch: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  match: { type: Type.NUMBER }
                },
                required: ["skill", "match"]
              }
            },
            careerPath: { type: Type.STRING },
            jobMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  match: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["role", "match", "description"]
              }
            }
          },
          required: ["score", "breakdown", "summary", "strengths", "weaknesses", "recommendations", "skillsMatch", "careerPath", "jobMatches"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }
}
