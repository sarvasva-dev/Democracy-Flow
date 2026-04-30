import { describe, expect, it, vi, afterEach } from "vitest";

const importService = async (apiKey = "") => {
    vi.resetModules();
    import.meta.env.VITE_SARVAM_API_KEY = apiKey;
    return import("../src/aiService.js");
};

afterEach(() => {
    vi.restoreAllMocks();
    delete import.meta.env.VITE_SARVAM_API_KEY;
});

describe("aiService", () => {
    it("falls back without calling the network when the Sarvam key is missing", async () => {
        const fetchMock = vi.fn();
        globalThis.fetch = fetchMock;
        const { getElectionIntelligence } = await importService("");

        const result = await getElectionIntelligence("What is NOTA?", {}, "english");

        expect(result.type).toBe("error");
        expect(result.source).toContain("Missing VITE_SARVAM_API_KEY");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("extracts strict JSON from model text and tolerates trailing commas", async () => {
        const { extractJsonObject } = await importService("");

        expect(extractJsonObject('```json\n{"title":"OK","suggested_followups":["A",],}\n```')).toEqual({
            title: "OK",
            suggested_followups: ["A"],
        });
    });

    it("normalizes unsupported languages to hinglish", async () => {
        const { normalizeLanguage } = await importService("");

        expect(normalizeLanguage("ENGLISH")).toBe("english");
        expect(normalizeLanguage("spanish")).toBe("hinglish");
    });

    it("sends bounded sanitized input to Sarvam with the configured key", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            type: "explanation",
                            title: "NOTA",
                            explanation: "A voter can reject listed candidates.",
                            example_or_impact: "Used on EVMs.",
                            conclusion: "It records voter dissatisfaction.",
                            reasoning_summary: "Grounded in polling process.",
                            suggested_followups: [],
                        }),
                    },
                }],
            }),
        });
        globalThis.fetch = fetchMock;
        const { getElectionIntelligence } = await importService("test-sarvam-key");

        const result = await getElectionIntelligence("  What is NOTA?\n<script>bad()</script>  ", { title: "Voting" }, "english");

        expect(result.source).toBe("Sarvam AI (Grounded)");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        const body = JSON.parse(options.body);
        expect(url).toBe("https://api.sarvam.ai/v1/chat/completions");
        expect(options.headers.Authorization).toBe("Bearer test-sarvam-key");
        expect(body.messages[1].content).toContain('USER QUERY: "What is NOTA? <script>bad()</script>"');
    });
});
