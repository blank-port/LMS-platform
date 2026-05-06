import { chatWithGemini } from './geminiService.js';

/**
 * AI Service for structured learning and productivity tasks.
 */

const extractJsonPayload = (rawText = '') => {
    if (!rawText || typeof rawText !== 'string') {
        throw new Error('No AI text received');
    }

    let candidate = rawText.trim();

    if (candidate.includes('```json')) {
        candidate = candidate.split('```json')[1].split('```')[0].trim();
    } else if (candidate.includes('```')) {
        candidate = candidate.split('```')[1].split('```')[0].trim();
    }

    try {
        return JSON.parse(candidate);
    } catch {
        const arrayMatch = candidate.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            return JSON.parse(arrayMatch[0]);
        }

        const objectMatch = candidate.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }
    }

    throw new Error('Unable to parse JSON payload');
};

/**
 * Generates a course curriculum outline based on title and category.
 */
export const generateCourseOutline = async (courseTitle, category) => {
    const prompt = `Generate a comprehensive curriculum for a course titled "${courseTitle}" in the category of "${category}".
    
    Return the response ONLY as a valid JSON object matching this structure:
    {
        "chapters": [
            {
                "chapterTitle": "Chapter Name",
                "chapterContent": [
                    { "lectureTitle": "Lecture Name", "lectureDuration": 15 }
                ]
            }
        ]
    }
    
    Provide at least 3-5 chapters with multiple lectures each. Duration should be in minutes.`;

    const systemPrompt = "You are an expert instructional designer. You only output valid JSON.";
    
    const response = await chatWithGemini(prompt, [], systemPrompt);
    
    if (response.success) {
        try {
            return { success: true, data: extractJsonPayload(response.text) };
        } catch (e) {
            console.error("[AIService] JSON Parse Error:", e);
            return { success: false, message: "Failed to parse AI curriculum. Please try again." };
        }
    }
    return response;
};

/**
 * Generates quiz questions based on a topic or course content.
 */
export const generateQuizQuestions = async (topic, count = 5) => {
    const prompt = `Generate ${count} multiple-choice quiz questions for the topic: "${topic}".
    
    Return the response ONLY as a valid JSON array of objects matching this structure:
    [
        {
            "questionText": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        }
    ]
    
    The "correctAnswer" is the index (0-3) of the correct option.`;

    const systemPrompt = "You are a professional assessment creator. You only output valid JSON arrays.";
    
    const response = await chatWithGemini(prompt, [], systemPrompt);
    
    if (response.success) {
        try {
            return { success: true, data: extractJsonPayload(response.text) };
        } catch (e) {
            return { success: false, message: "Failed to parse AI questions. Please try again." };
        }
    }
    return response;
};

/**
 * Gets personalized course recommendations.
 */
export const getCourseRecommendations = async (interests, catalog) => {
    const catalogBrief = catalog.map(c => ({ id: c._id, title: c.courseTitle, category: c.category?.name })).slice(0, 20);
    
    const prompt = `Based on these user interests: "${interests.join(', ')}", recommend the best 3 courses from this catalog: ${JSON.stringify(catalogBrief)}.
    
    Return ONLY a JSON array of the recommended course IDs.
    Example: ["id1", "id2", "id3"]`;

    const systemPrompt = "You are a personalized learning advisor. You only output valid JSON arrays of IDs.";
    
    const response = await chatWithGemini(prompt, [], systemPrompt);
    
    if (response.success) {
        try {
            const ids = extractJsonPayload(response.text);
            return { success: true, data: Array.isArray(ids) ? ids : [] };
        } catch (e) {
            console.error("[getCourseRecommendations] Parsing Error:", e);
            return { success: false, message: "Recommendation synthesis failed." };
        }
    }
    return { success: false, message: response.message || response.text || "AI Intelligence failure" };
};

/**
 * Summarizes lesson content for rapid cognitive anchors.
 */
export const summarizeLessonContent = async (lessonTitle, content) => {
    const prompt = `Provide a concise, high-impact summary of this lesson: "${lessonTitle}".
    Description: "${content}".
    
    Focus on core concepts. Keep it under 150 words. Use professional but accessible language.`;

    const systemPrompt = "You are a senior academic cognitive specialist. Provide summaries that help students retain core information.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    return response;
};

/**
 * Generates key takeaways for a lesson.
 */
export const generateKeyTakeaways = async (lessonTitle, content) => {
    const prompt = `Extract exactly 3-5 bulleted key takeaways from this lesson description:
    Lesson: "${lessonTitle}"
    Context: "${content}"
    
    Format as a clean markdown list. Each takeaway should be actionable or a fundamental truth.`;

    const systemPrompt = "You are an expert educational strategist. Your goal is to distill complex lessons into actionable binary knowledge.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    return response;
};

/**
 * Explains a complex concept using the Feynman Technique (ELI5).
 */
export const explainComplexConcept = async (concept, detail = "General") => {
    const prompt = `Explain "${concept}" using the Feynman Technique. 
    Detail Level: ${detail}
    
    Explain it as if I am 12 years old, but keep it scientifically rigorous. Use a relatable analogy.`;

    const systemPrompt = "You are a world-class science communicator. Make complex ideas feel intuitively simple.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    return response;
};

/**
 * Detects learning weaknesses based on quiz and assignment data.
 */
export const detectWeaknesses = async (performanceData) => {
    const prompt = `Analyze this student performance data and identify the top 2-3 weak areas or "learning gaps":
    ${JSON.stringify(performanceData)}
    
    Provide specific revision guidance for each gap. 
    Format:
    ### [Topic Name]
    * **Gap**: Description of what is being missed.
    * **Action**: Specific revision step.`;

    const systemPrompt = "You are a diagnostic learning coach. You analyze data to find patterns of struggle and offer surgical revision advice.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    return response;
};

/**
 * Generates a personalized study plan/directive.
 */
export const getStudyPlan = async (studentData) => {
    const prompt = `Create a personalized, 3rd-person "Study Directive" for this student:
    ${JSON.stringify(studentData)}
    
    Consider:
    1. Upcoming live sessions (prioritize these).
    2. Pending assignments.
    3. Current course progress.
    4. Detected weaknesses (if any).
    
    Format as a short, motivating directive (max 200 words).`;

    const systemPrompt = "You are PrismBot, the AI Learning Copilot. You provide authoritative, motivating, and strategic guidance.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    return response;
};

/**
 * Generates interactive flashcards based on lesson content.
 */
export const generateFlashcardsForLesson = async (lessonTitle, content, count = 5) => {
    const prompt = `Generate ${count} high-quality flashcards for the lesson: "${lessonTitle}".
    Description: "${content}"
    
    Return ONLY a JSON array of objects:
    [
        { "question": "Clear, concise question?", "answer": "Informative but brief answer." }
    ]`;

    const systemPrompt = "You are an expert in active recall and spaced repetition. You create flashcards that target core conceptual understanding.";
    const response = await chatWithGemini(prompt, [], systemPrompt);
    
    if (response.success) {
        try {
            const cards = extractJsonPayload(response.text);
            return { success: true, data: Array.isArray(cards) ? cards : [] };
        } catch (e) {
            return { success: false, message: "Flashcard parsing failed." };
        }
    }
    return response;
};

/**
 * Conducts a section of a mock interview/viva.
 */
export const conductMockInterview = async (moduleTitle, history, currentInput) => {
    const prompt = `${currentInput}`;

    const systemPrompt = `You are a professional, rigorous technical interviewer conducting a "Viva" (oral exam) for the module: "${moduleTitle}".
    
    Rules:
    1. Assess the student's knowledge based on their previous answers.
    2. Ask challenging but constructive questions.
    3. If the student answers well, move to more advanced topics.
    4. If the student struggles, explain briefly and ask a simpler prerequisite question.
    5. Be professional and encouraging.
    6. Maintain a conversational flow.
    7. After 5-7 exchanges, provide a brief summary of their performance including a clear score in the format [X/100]. Example: "Total Marks: 85/100".`;


    const response = await chatWithGemini(prompt, history, systemPrompt);
    return response;
};
