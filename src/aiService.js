const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || "sk_46pgwilu_LUY4lB7vZp2B1IrRksHIHSua";

/**
 * Sarvam AI Service - Sole Intelligence Layer
 */
export const getElectionIntelligence = async (userInput, scrollStage = "General", language = "hinglish") => {
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
            console.error("Failed to parse this content:", content);
            throw new Error("JSON Parse Error: " + parseError.message);
        }
        jsonResponse.source = "Sarvam AI";
        return jsonResponse;
    } catch (error) {
        console.error("Sarvam Generation Error:", error);
        return {
            type: "error",
            title: "System Offline",
            explanation: "I'm having trouble connecting to the election database right now. Please check your internet connection.",
            example_or_impact: "Error: " + error.message,
            conclusion: "Please try asking again.",
            reasoning_summary: "Failed to fetch response from API.",
            suggested_followups: [],
            source: "System Error"
        };
    }
};
