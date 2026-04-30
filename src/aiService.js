const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || "";
const SARVAM_MODEL = import.meta.env.VITE_SARVAM_MODEL || "sarvam-m";
const SARVAM_ENDPOINT = "https://api.sarvam.ai/v1/chat/completions";
const VALID_LANGUAGES = new Set(["hinglish", "hindi", "english"]);
const MAX_QUERY_LENGTH = 500;

export const normalizeLanguage = (language = "hinglish") => {
    const normalized = String(language).toLowerCase().trim();
    return VALID_LANGUAGES.has(normalized) ? normalized : "hinglish";
};

const normalizeUserInput = (userInput) => String(userInput || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

export const extractJsonObject = (content = "") => {
    const jsonMatch = String(content).match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0].replace(/,\s*([}\]])/g, "$1"));
};

const createFallbackResponse = (language, errorMessage) => {
    const isHindi = language === "hindi";
    return {
        type: "error",
        title: isHindi ? "सिस्टम ऑफलाइन" : "System Offline",
        explanation: isHindi ? "मुझे अभी चुनाव डेटाबेस से जुड़ने में समस्या हो रही है।" : "I'm having trouble connecting to the election database right now.",
        example_or_impact: "Error: " + errorMessage,
        conclusion: isHindi ? "कृपया पुनः प्रयास करें।" : "Please try asking again.",
        reasoning_summary: "Failed to fetch response from API.",
        suggested_followups: [],
        source: `System Error: ${errorMessage}`
    };
};

const buildStageInfo = (scrollStage) => {
    if (typeof scrollStage !== "object" || scrollStage === null) {
        return `Current Context: ${String(scrollStage || "General")}`;
    }

    return `
    Current Stage: ${scrollStage.title || "General"}
    Stage Context: ${scrollStage.description || "N/A"}
    Stage Details: ${(scrollStage.details || []).join(", ")}
    `;
};

/**
 * Sarvam AI Service - Sole Intelligence Layer
 */
export const getElectionIntelligence = async (userInput, scrollStage = {}, language = "hinglish") => {
    const safeLanguage = normalizeLanguage(language);
    const safeInput = normalizeUserInput(userInput);

    if (!SARVAM_API_KEY) {
        return createFallbackResponse(safeLanguage, "Missing VITE_SARVAM_API_KEY");
    }

    if (!safeInput) {
        return createFallbackResponse(safeLanguage, "Question cannot be empty");
    }

    // Grounding data from the current UI state
    const stageInfo = buildStageInfo(scrollStage);
    const stageTitle = typeof scrollStage === "object" && scrollStage !== null
        ? scrollStage.title || "General"
        : String(scrollStage || "General");

    const prompt = `
You are an expert, high-fidelity Election AI Mentor for the Indian Democratic Process.

GROUND TRUTH DATA (Strictly follow this if the query relates to the current view):
${stageInfo}

STRICT FACTUALITY PROTOCOL:
- Your primary source is the Election Commission of India (ECI) guidelines.
- NEVER hallucinate election dates.
- Stick to process, logic, and law.
- If the user query is about the current stage, use the GROUND TRUTH DATA above to answer correctly.

Current Context (based on user scroll): [${stageTitle}]
USER QUERY: "${safeInput}"

INSTRUCTIONS:
1. GREETING PROTOCOL: If the user says 'hi', 'hello', or greets you, respond naturally as a friendly mentor before diving into any context.
2. Explain concepts or scenarios using the requested language.
3. Ensure the tone is conversational, educational, and professional.
4. Always provide an Indian context or real-world example.
5. Provide a short "reasoning_summary" (1-2 lines) explaining the logic behind your answer.
6. All parts of the JSON (title, explanation, suggestions, etc.) MUST be in the requested language [${safeLanguage.toUpperCase()}].

OUTPUT FORMAT:
You MUST return ONLY valid JSON matching this exact structure, with no markdown formatting or backticks.
{
  "type": "explanation | scenario | greeting",
  "title": "A catchy, clear title (In [${safeLanguage.toUpperCase()}])",
  "explanation": "The core explanation or greeting (In [${safeLanguage.toUpperCase()}])",
  "example_or_impact": "A real-world Indian example OR context (In [${safeLanguage.toUpperCase()}])",
  "conclusion": "A strong concluding sentence (In [${safeLanguage.toUpperCase()}])",
  "reasoning_summary": "1-2 lines logic (In [${safeLanguage.toUpperCase()}])",
  "suggested_followups": ["Suggestion 1 in [${safeLanguage.toUpperCase()}]", "Suggestion 2 in [${safeLanguage.toUpperCase()}]"]
}
`;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
        const response = await fetch(SARVAM_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SARVAM_API_KEY}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: SARVAM_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You strictly output valid JSON.
                        You MUST respond 100% in [${safeLanguage.toUpperCase()}].

                        RULES for [${safeLanguage.toUpperCase()}]:
                        - If English: Use ONLY Latin script. NO Hindi/Hinglish words at all.
                        - If Hindi: Use ONLY Devanagari script.
                        - If Hinglish: Use Latin script with a 50/50 mix of Hindi and English words (e.g., 'EVM machine ka use vote dene ke liye kiya jata hai').

                        IGNORE the query language. Stick ONLY to the language specified in the system instruction.`
                    },
                    { role: "user", content: prompt + `\n\nREMINDER: RESPOND 100% IN [${safeLanguage.toUpperCase()}] ONLY.` }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) throw new Error("Sarvam API failed");
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || "";
        const jsonResponse = extractJsonObject(content);
        jsonResponse.source = "Sarvam AI (Grounded)";
        return jsonResponse;
    } catch (error) {
        return createFallbackResponse(safeLanguage, error.message);
    } finally {
        window.clearTimeout(timeoutId);
    }
};
