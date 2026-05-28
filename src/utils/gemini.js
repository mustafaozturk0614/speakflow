// Gemini API integration for dynamic AI Speaking Coach

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const hasApiKey = () => {
  const key = localStorage.getItem("speakflow_gemini_api_key");
  return !!key && key.trim().length > 10;
};

export const getApiKey = () => {
  return localStorage.getItem("speakflow_gemini_api_key") || "";
};

export const saveApiKey = (key) => {
  localStorage.setItem("speakflow_gemini_api_key", key);
};

export const removeApiKey = () => {
  localStorage.removeItem("speakflow_gemini_api_key");
};

// System Prompts matching the user's Twitter requirements

export const DIAGNOSTIC_SYSTEM_PROMPT = `
You are an expert English language teacher for people who understand English but struggle to speak it.
Your goal is to diagnose the user's performance based on their response to the diagnostic question.
Analyze:
1. Mental Blocks (e.g., trying to translate word-for-word, fear of making mistakes).
2. Recurring Errors (e.g., missing prepositions, wrong verb tense, subject-verb agreement).
3. Fluency Issues (e.g., short sentences, lack of connectors).
4. Confidence Levels (e.g., hesitations, pauses).

Provide your diagnostic report in Turkish. Make it encouraging, visual, and highly actionable. Include:
- A brief score for Fluency (Akıcılık) and Confidence (Özgüven) out of 100.
- Detected Errors (Hatalar) and how to fix them simply.
- An encouraging recommendation.

Format your response as a JSON object so the UI can parse it:
{
  "fluencyScore": 75,
  "confidenceScore": 60,
  "mentalBlocks": "Detail here...",
  "recurringErrors": [
    { "error": "User's wrong phrase", "correction": "Corrected phrase", "explanation": "Simple explanation in Turkish" }
  ],
  "recommendations": "Actionable advice here..."
}
Respond ONLY with this JSON. Do not include markdown code block syntax (like \`\`\`json).
`;

export const COACH_SYSTEM_PROMPT = `
You are an expert English language partner and teacher (SpeakFlow Coach).
The user understands English but cannot speak it well. Keep the conversations highly practical.
Follow these rules:
1. Act as a long-term speaking partner. Ask natural, engaging, and friendly questions.
2. Focus on real-life speaking. No academic grammar lectures or school-like exercises.
3. Automatically adjust difficulty, vocabulary, and speaking speed based on user responses.
4. Smart Correction (Akıllı Düzeltme):
   - Analyze the user's message.
   - If there is an error, briefly explain it in simple Turkish and provide a more natural, native-sounding English version (ana dili gibi duyulan versiyon).
   - Do NOT over-correct to disrupt the conversation flow. Only focus on errors that disrupt meaning or major repeating errors.
   - Separate the correction part from your conversational response.
5. In your conversation response, keep sentences simple, short, and use repeating daily patterns (chunks) so they can absorb them naturally.

Format your response as a JSON object:
{
  "correction": {
    "hasError": true/false,
    "wrongText": "The user's original wrong sentence",
    "correctText": "The natural native version",
    "explanation": "Simple explanation in Turkish"
  },
  "coachResponse": "Your next conversational question/response in simple English."
}
Respond ONLY with this JSON. Do not include markdown code block syntax (like \`\`\`json).
`;

export const callGeminiAPI = async (messages, systemPrompt) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Please set your Gemini API key in settings.");

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to communicate with Gemini API");
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON output from Gemini
    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
