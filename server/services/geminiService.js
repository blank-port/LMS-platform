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
    try {
        const setting = await Setting.findOne({ key: 'gemini_api_key' });
        if (setting && typeof setting.value === 'string' && setting.value.trim().length > 0) {
            return setting.value.trim();
        }
    } catch (err) {
        console.error("[GeminiService] Error fetching key from DB:", err.message);
    }
    return process.env.GEMINI_API_KEY || null;
};

// Check if AI chat is enabled
export const isAiChatEnabled = async () => {
    const setting = await Setting.findOne({ key: 'ai_chat_enabled' });
    return setting?.value === true || setting?.value === 'true' || false;
};

// Send a message to Gemini and get a response
export const chatWithGemini = async (message, history = [], systemPromptOverride = null, modelOverride = null) => {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
        return {
            success: false,
            message: "AI chat is not configured yet. Please ask the admin to set the Gemini API key in Settings → API Settings."
        };
    }

    const currentSystemPrompt = systemPromptOverride || SYSTEM_PROMPT;

    // Try broadly-supported models first to maximize compatibility across keys/regions.
    const modelsToTry = modelOverride ? [modelOverride] : [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Detect legacy models that don't support systemInstruction
            const isLegacyModel = modelName.includes('1.0') || modelName === 'gemini-pro';
            
            // Format systemInstruction for all modern models (1.5+, 2.x, 3.x)
            const modelConfigs = { model: modelName };
            if (!isLegacyModel) {
                modelConfigs.systemInstruction = { parts: [{ text: currentSystemPrompt }] };
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

            // For legacy models that don't support systemInstruction,
            // prepend context to history manually
            if (isLegacyModel) {
                formattedHistory.unshift(
                    { role: 'user', parts: [{ text: "Context: " + currentSystemPrompt }] },
                    { role: 'model', parts: [{ text: "Understood." }] }
                );
            }

            const chat = model.startChat({ history: formattedHistory });
            const result = await chat.sendMessage(message);
            const text = result.response.text();

            return { success: true, text };
        } catch (error) {
            console.error(`[GeminiService] Model ${modelName} failed:`, error.message);
            lastError = error;
            
            if (modelOverride) break;
            // 429/RESOURCE_EXHAUSTED: same API key → all models will fail, break immediately
            if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
                break;
            }
            // 404/not found: model unavailable in this region, try next model
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                continue;
            }
            break;
        }
    }

    // If we get here, all models failed
    const errMsg = lastError?.message || "";
    console.error(`[GeminiService] All models failed. Last Error: ${errMsg}. Using key ending in: ${apiKey.slice(-5)}`);

    if (errMsg.includes('404')) {
        return {
            success: false,
            message: `The configured Gemini models are unavailable for this API key or region. Last checked models: ${modelsToTry.join(', ')}.`
        };
    }
    if (errMsg.includes('403')) {
        return {
            success: false,
            message: 'Gemini rejected the request with a permissions error. Please verify the API key and its restrictions.'
        };
    }
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        return {
            success: false,
            message: 'Gemini quota is exhausted right now. Please wait a minute and try again.'
        };
    }

    return {
        success: false,
        message: "I'm having a bit of trouble connecting to the AI brain. Please check your API key or try again! 🔄"
    };
};
