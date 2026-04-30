import { describe, expect, it, vi } from "vitest";

vi.mock("../src/googleServices.js", () => ({
    trackEvent: vi.fn(),
}));

import { createElectionResponseHtml, escapeHtml } from "../src/uiController.js";

describe("uiController security helpers", () => {
    it("escapes user-controlled HTML characters", () => {
        expect(escapeHtml(`<img src=x onerror="alert('x')">`))
            .toBe("&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;");
    });

    it("renders mentor response markup without allowing injected script tags", () => {
        const html = createElectionResponseHtml({
            source: "Sarvam <script>alert(1)</script>",
            title: "Title <img>",
            explanation: "Use <b>safe</b> text",
            example_or_impact: "Impact & example",
            reasoning_summary: "Because <script>bad()</script>",
            conclusion: "Done",
        });

        expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
        expect(html).toContain("Use &lt;b&gt;safe&lt;/b&gt; text");
        expect(html).not.toContain("<script>");
        expect(html).toContain("<strong>");
    });
});
