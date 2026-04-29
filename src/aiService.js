const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || "sk_46pgwilu_LUY4lB7vZp2B1IrRksHIHSua";

/**
 * Sarvam AI Service - Sole Intelligence Layer
 */
export const getElectionIntelligence = async (userInput, scrollStage = "General") => {
    const prompt = `
You are an expert Election AI Mentor for the Indian Democratic Process.
Your goal is to educate the user about Indian elections and reason through complex scenarios.

Current Context (based on user scroll): [${scrollStage}]
USER QUERY: "${userInput}"

INSTRUCTIONS:
1. Explain concepts or scenarios using a mix of simple English and Hinglish.
2. Ensure the tone is conversational, educational, and easy to understand.
3. If it's a "what if" scenario, explain the legal ruling clearly.
4. Always provide an Indian context or real-world example.
5. Provide a short "reasoning_summary" (1-2 lines) explaining the logic behind your answer.

OUTPUT FORMAT:
You MUST return ONLY valid JSON matching this exact structure, with no markdown formatting or backticks.
IMPORTANT: Do NOT use double quotes (") inside the text values. Use single quotes (') instead to prevent JSON parsing errors.
{
  "type": "explanation | scenario",
  "title": "A catchy, clear title",
  "explanation": "The core explanation or legal ruling (can use Hinglish)",
  "example_or_impact": "A real-world Indian example OR the impact of the scenario",
  "conclusion": "A strong concluding sentence",
  "reasoning_summary": "1-2 lines explaining why this happens legally or logically",
  "suggested_followups": ["Question 1", "Question 2"]
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
                    { role: "system", content: "You strictly output valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6
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
