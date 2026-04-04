import { GoogleGenerativeAI } from '@google/generative-ai';
import Setting from '../models/Setting.js';

// System prompt for the PrismEd AI Sales & Support Assistant
const SYSTEM_PROMPT = `You are PrismBot, the AI Sales & Onboarding Assistant for PrismEd — a premium online learning management system.

Your personality: Professional, warm, encouraging, and conversion-focused. You guide users through:
1. Collecting their name and email for registration
2. Recommending relevant courses based on their interests
3. Answering questions about courses, pricing, and enrollment
4. Providing SEO and blog topic suggestions when asked
5. Handling objections (price, difficulty, time commitment)

RULES:
- NEVER reveal passwords in chat — only send via email
- Be concise — messages should be 2-4 short paragraphs max
- Use emojis sparingly but effectively
- If a user asks about a topic not related to education/learning, gently redirect them
- Always encourage enrollment and engagement
- Format course listings cleanly with bullet points
- For SEO questions, provide specific keyword suggestions for EdTech

CONTEXT: You are embedded in a chat bubble on the PrismEd platform. Users may or may not be logged in.`;

// Get Gemini API key from DB settings (admin-configurable)
const getGeminiKey = async () => {
    const setting = await Setting.findOne({ key: 'gemini_api_key' });
    if (setting && setting.value && setting.value.trim().length > 0) {
        return setting.value;
    }
    return process.env.GEMINI_API_KEY || null;
};

// Check if AI chat is enabled
export const isAiChatEnabled = async () => {
    const setting = await Setting.findOne({ key: 'ai_chat_enabled' });
    return setting?.value === true || setting?.value === 'true' || false;
};

// Send a message to Gemini and get a response
export const chatWithGemini = async (message, history = []) => {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
        return {
            success: false,
            text: "AI chat is not configured yet. Please ask the admin to set the Gemini API key in Settings → API Settings."
        };
    }

    // Try multiple models in order of performance for maximum compatibility
    const modelsToTry = [
        'gemini-1.5-flash', 
        'gemini-1.5-flash-latest', 
        'gemini-1.5-pro',
        'gemini-pro', 
        'gemini-1.0-pro'
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Format systemInstruction based on model capability
            const modelConfigs = { model: modelName };
            if (modelName.includes('1.5')) {
                modelConfigs.systemInstruction = { parts: [{ text: SYSTEM_PROMPT }] };
            }

            const model = genAI.getGenerativeModel(modelConfigs);
            
            // Build chat history for Gemini (strict SDK validation)
            let formattedHistory = [];
            const rawHistory = history.filter((_, i) => i < history.length - 1); 
            
            for (const msg of rawHistory) {
                const role = msg.role === 'user' ? 'user' : 'model';
                if (formattedHistory.length === 0 && role === 'model') continue;
                if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
                    formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + msg.content;
                } else {
                    formattedHistory.push({ role, parts: [{ text: msg.content }] });
                }
            }

            // For models that don't support systemInstruction (1.0 pro), 
            // prepend context to history manually
            if (!modelName.includes('1.5')) {
                formattedHistory.unshift(
                    { role: 'user', parts: [{ text: "Context: " + SYSTEM_PROMPT }] },
                    { role: 'model', parts: [{ text: "Understood. I am PrismBot." }] }
                );
            }

            const chat = model.startChat({ history: formattedHistory });
            const result = await chat.sendMessage(message);
            const text = result.response.text();

            return { success: true, text };
        } catch (error) {
            console.error(`[GeminiService] Model ${modelName} failed:`, error.message);
            lastError = error;
            
            // If it's a 404 (Model not found), try the next model in the list
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                continue;
            }
            
            // If it's a 429 or 403, it's likely a key problem, so stop trying.
            break;
        }
    }

    // If we get here, all models failed
    const errMsg = lastError?.message || "";
    console.error(`[GeminiService] All models failed. Last Error: ${errMsg}. Using key ending in: ${apiKey.slice(-5)}`);

    if (errMsg.includes('404')) {
        return { 
            success: false, 
            text: `⚠️ Error 404: The Gemini models [${modelsToTry.join(', ')}] are not responding to this API key in your region. (Key: ...${apiKey.slice(-5)}). Please check your Google Cloud Console → APIs & Services → Enabled APIs to ensure the 'Generative Language API' is active.` 
        };
    }
    if (errMsg.includes('403')) {
        return { success: false, text: "⚠️ Error 403: Specific Permission Denied. Your API key may be restricted or invalid." };
    }
    if (errMsg.includes('429')) {
        return { success: false, text: "⚠️ AI quota exceeded. Please try again in 1 minute! ⏳" };
    }
    
    return { success: false, text: "I'm having a bit of trouble connecting to the AI brain. Please check your API key or try again! 🔄" };
};
