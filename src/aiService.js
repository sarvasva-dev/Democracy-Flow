const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

const fallbackResponses = {
    english: {
        title: "Service Temporarily Offline",
        explanation: "I am having trouble connecting to the election mentor service right now. Please check the API key or internet connection.",
        example_or_impact: "For example, if the Sarvam API key is missing, the app cannot generate live election answers.",
        conclusion: "Add a valid VITE_SARVAM_API_KEY and try again.",
        reasoning_summary: "The request could not reach the configured AI service.",
    },
    hindi: {
        title: "सेवा अस्थायी रूप से बंद है",
        explanation: "अभी चुनाव मेंटर सेवा से जुड़ने में समस्या आ रही है। कृपया API key या internet connection जांचें।",
        example_or_impact: "उदाहरण के लिए, Sarvam API key न होने पर app live election answers नहीं बना पाएगा।",
        conclusion: "सही VITE_SARVAM_API_KEY जोड़कर दोबारा कोशिश करें।",
        reasoning_summary: "Configured AI service तक request पूरी नहीं पहुंच पाई।",
    },
    hinglish: {
        title: "Service abhi temporarily offline hai",
        explanation: "Election mentor service se connect karne mein abhi issue aa raha hai. API key ya internet connection check karo.",
        example_or_impact: "Example ke liye, agar Sarvam API key missing hai to app live election answers generate nahi kar paayega.",
        conclusion: "Valid VITE_SARVAM_API_KEY add karke phir try karo.",
        reasoning_summary: "Request configured AI service tak successfully complete nahi ho paayi.",
    }
};

const createFallbackResponse = (language = "hinglish", errorMessage = "AI service unavailable") => {
    const fallback = fallbackResponses[language] || fallbackResponses.hinglish;

    return {
        type: "error",
        ...fallback,
        suggested_followups: [],
        source: `System Error: ${errorMessage}`
    };
};

/**
 * Sarvam AI Service - Sole Intelligence Layer
 */
export const getElectionIntelligence = async (userInput, scrollStage = "General", language = "hinglish") => {
    if (!SARVAM_API_KEY) {
        return createFallbackResponse(language, "Missing VITE_SARVAM_API_KEY");
    }

    const prompt = `
You are an expert, high-fidelity Election AI Mentor for the Indian Democratic Process.

STRICT FACTUALITY PROTOCOL:
- Your primary source is the Election Commission of India (ECI) guidelines.
- NEVER hallucinate election dates.
- Stick to process, logic, and law.

// Language instructions moved to system message for forcefulness

Current Context (based on user scroll): [${scrollStage}]
USER QUERY: "${userInput}"

INSTRUCTIONS:
1. GREETING PROTOCOL: If the user says 'hi', 'hello', or greets you, respond naturally as a friendly mentor before diving into any context.
2. Explain concepts or scenarios using the requested language.
3. Ensure the tone is conversational, educational, and professional.
4. Always provide an Indian context or real-world example.
5. Provide a short "reasoning_summary" (1-2 lines) explaining the logic behind your answer.
6. All parts of the JSON (title, explanation, suggestions, etc.) MUST be in the requested language [${language.toUpperCase()}].

OUTPUT FORMAT:
You MUST return ONLY valid JSON matching this exact structure, with no markdown formatting or backticks.
{
  "type": "explanation | scenario | greeting",
  "title": "A catchy, clear title (In [${language.toUpperCase()}])",
  "explanation": "The core explanation or greeting (In [${language.toUpperCase()}])",
  "example_or_impact": "A real-world Indian example OR context (In [${language.toUpperCase()}])",
  "conclusion": "A strong concluding sentence (In [${language.toUpperCase()}])",
  "reasoning_summary": "1-2 lines logic (In [${language.toUpperCase()}])",
  "suggested_followups": ["Suggestion 1 in [${language.toUpperCase()}]", "Suggestion 2 in [${language.toUpperCase()}]"]
}
`;

    try {
        const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SARVAM_API_KEY}`
            },
            body: JSON.stringify({
                model: "sarvam-m",  
                messages: [
                    { 
                        role: "system", 
                        content: `You strictly output valid JSON. 
                        You MUST respond 100% in [${language.toUpperCase()}]. 
                        
                        RULES for [${language.toUpperCase()}]:
                        - If English: Use ONLY Latin script. NO Hindi/Hinglish words at all.
                        - If Hindi: Use ONLY Devanagari script.
                        - If Hinglish: Use Latin script with a 50/50 mix of Hindi and English words (e.g., 'EVM machine ka use vote dene ke liye kiya jata hai').
                        
                        IGNORE the query language. Stick ONLY to the language specified in the system instruction.` 
                    },
                    { role: "user", content: prompt + `\n\nREMINDER: RESPOND 100% IN [${language.toUpperCase()}] ONLY.` }
                ],
                temperature: 0.1 // Lower temperature for more strictness
            })
        });
        
        if (!response.ok) throw new Error("Sarvam API failed");
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Extract JSON object using regex
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response: " + content.substring(0, 50));
        }
        
        content = jsonMatch[0];
        
        // Remove trailing commas before closing braces/brackets which can break JSON.parse
        content = content.replace(/,\s*([\}\]])/g, '$1');

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(content);
        } catch (parseError) {
            if (import.meta.env.DEV) {
                console.error("Failed to parse this content:", content);
            }
            throw new Error("JSON Parse Error: " + parseError.message);
        }
        jsonResponse.source = "Sarvam AI";
        return jsonResponse;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Sarvam Generation Error:", error);
        }
        return createFallbackResponse(language, error.message);
    }
};
