# Democracy Flow: AI-Guided Election Intelligence

**A Prompt Wars submission for election process education**

> Empowering the world's largest democracy through intent-driven engineering and high-fidelity AI mentorship.

## The Vision

Democracy Flow is a cinematic educational journey for understanding the Indian election process. Traditional civic education is often buried in dry PDFs and legal jargon, so this project turns the election lifecycle into a scroll-synchronized, interactive experience.

By combining GSAP-driven scroll orchestration with Sarvam AI, Democracy Flow gives citizens a personal Election Mentor that can answer questions in Hindi, English, or Hinglish.

## Technical Architecture

The project uses a Sarvam-native intelligence layer so the AI experience can better match Indian language and civic education needs.

- **Intelligence layer:** `sarvam-m` handles scenario reasoning such as "What happens if NOTA wins?" or "Can I register without an address?"
- **Linguistic processing:** Prompt guardrails enforce the selected language mode: Devanagari for Hindi, Latin script for English and Hinglish.
- **ECI-aligned factuality guardrails:** The system prompt instructs the AI to stay aligned with Election Commission of India process, avoid hallucinated dates, and stick to election logic and law.
- **Google services layer:** Firebase Web SDK initializes optional Analytics and Performance Monitoring from `VITE_FIREBASE_*` environment variables, then tracks app opens, mentor questions, language switches, quiz answers, workflow views, and badge claims.
- **Security hardening:** Secrets are read only from environment variables, user input is bounded before it reaches the model, and rendered AI/user content is HTML-escaped before entering the chat UI.

## AI Workflow and Prompt Strategy

The core of the project is intent-driven prompt engineering, shaped for a fast Prompt Wars demo.

1. **Context-aware mentorship:** The AI knows the user's current scroll stage, such as nomination, polling day, or counting, and adjusts its answer accordingly.
2. **JSON-strict responses:** AI output is constrained into a predictable JSON schema so the UI can render title, explanation, examples, reasoning, and follow-up prompts safely.
3. **Multilingual guardrails:** System and user prompts reinforce the selected language, even when the user's query is written in another language.
4. **Graceful fallback:** If the API key or network is unavailable, the mentor returns a language-aware fallback instead of breaking the chat.

## Key Features

- Interactive scroll journey through the election lifecycle.
- Multilingual AI mentor in Hindi, English, and Hinglish.
- Quick quiz engine for stage-wise knowledge checks.
- Informed voter badge and LinkedIn sharing flow.
- Landscape mobile guardrail for cinematic viewing on phones.

## Installation and Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/democracy-flow.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a local `.env` file:
    ```env
    VITE_SARVAM_API_KEY=your_sarvam_key_here
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_ga_measurement_id
    ```

4. Run the development server:
    ```bash
    npm run dev
    ```

5. Build for production:
    ```bash
    npm run build
    ```

6. Run tests:
    ```bash
    npm test
    ```

## Prompt Wars Story

Democracy Flow was built through intent-based engineering: the idea, interaction flow, multilingual mentor behavior, JSON response structure, and scroll synchronization were iterated through AI-assisted development.

The result is a working civic education experience that shows how AI-native tools can turn a public-interest topic into something more accessible, visual, and conversational.

**Built for Prompt Wars by SarthakML**
