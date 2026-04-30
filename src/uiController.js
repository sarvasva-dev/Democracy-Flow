import { electionStages } from './electionData.js';
import { getElectionIntelligence } from './aiService.js';
import { trackEvent } from './googleServices.js';

let currentStageContext = electionStages[0]; // Start with the first stage object

const demoQueries = [
    "What happens if NOTA wins?",
    "EVM kaise kaam karta hai?",
    "What if a candidate dies before results?"
];

export const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const createElectionResponseHtml = (data = {}) => {
    let responseHtml = `<div class="ai-source-indicator" style="font-size: 0.7rem; color: var(--primary); text-transform: uppercase; margin-bottom: 8px;">Powered by: ${escapeHtml(data.source || 'Sarvam AI')}</div>`;
    responseHtml += `<strong>${escapeHtml(data.title || "Election Mentor")}</strong><br/><br/>`;
    responseHtml += `${escapeHtml(data.explanation || "")}<br/><br/>`;
    responseHtml += `<em>Example/Impact:</em> ${escapeHtml(data.example_or_impact || "")}<br/><br/>`;

    if (data.reasoning_summary) {
        responseHtml += `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 0.85rem;">
            <strong>&#129504; Why this answer?</strong><br/>
            ${escapeHtml(data.reasoning_summary)}
        </div><br/>`;
    }

    responseHtml += `<strong>Conclusion:</strong> ${escapeHtml(data.conclusion || "")}`;
    return responseHtml;
};

export const initUI = () => {
    initTimeline();
    renderAllStages();
    renderSuggestions();
    setupChatLogic();
    setupMinimizeLogic();
    setupWorkflowLogic();
    setupBadgeLogic();
};

const setupBadgeLogic = () => {
    const btn = document.getElementById('claim-badge-btn');
    if (btn) {
        btn.addEventListener('click', claimBadgeAction);
    }
};

const claimBadgeAction = () => {
    const shareBtn = document.getElementById('share-linkedin');
    const badgeBtn = document.getElementById('claim-badge-btn');

    if (badgeBtn) {
        badgeBtn.innerHTML = "&#10024; Badge Claimed!";
        badgeBtn.style.borderColor = "#10b981";
        badgeBtn.style.color = "#10b981";
        badgeBtn.disabled = true;
    }

    if (shareBtn) {
        const text = encodeURIComponent("I just completed my journey to becoming an Informed Voter with Democracy Flow! 🇮🇳 Check out this AI-Guided experience for Prompt Wars.");
        const url = encodeURIComponent(window.location.href);
        shareBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
        shareBtn.classList.remove('hidden');
    }

    trackEvent("badge_claimed", { stage: currentStageContext.id });
};

const setupWorkflowLogic = () => {
    const btn = document.getElementById('workflow-btn');
    const modal = document.getElementById('workflow-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (btn && modal && closeBtn) {
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
        };

        const openModal = () => {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            trackEvent("workflow_opened", { stage: currentStageContext.id });
        };

        btn.onclick = openModal;
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
        });
    }
};

const renderAllStages = () => {
    const container = document.getElementById('stages-scroll-container');
    if (!container) return;

    container.innerHTML = '';
    electionStages.forEach((stage, sIdx) => {
        const block = document.createElement('div');
        block.className = 'stage-block';
        block.id = `block-${stage.id}`;

        let detailsHtml = '';
        if (stage.details && stage.details.length > 0) {
            detailsHtml = `<ul class="stage-details-list" aria-label="${escapeHtml(stage.title)} details">
                ${stage.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>`;
        }

        let quizHtml = '';
        if (stage.quiz) {
            quizHtml = `
                <div class="quiz-section glass">
                    <h4>&#128221; Quick Quiz</h4>
                    <p class="quiz-q">${escapeHtml(stage.quiz.question)}</p>
                    <div class="quiz-options">
                        ${stage.quiz.options.map((opt, oIdx) => `
                            <button class="quiz-opt-btn" type="button" data-stage-index="${sIdx}" data-option-index="${oIdx}">${escapeHtml(opt)}</button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback hidden"></div>
                </div>
            `;
        }

        block.innerHTML = `
            <h2>${escapeHtml(stage.title)}</h2>
            <p>${escapeHtml(stage.description)}</p>
            ${detailsHtml}
            ${quizHtml}
        `;
        container.appendChild(block);
    });

    container.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            checkAnswer(Number(btn.dataset.stageIndex), Number(btn.dataset.optionIndex), btn);
        });
    });
};

const checkAnswer = (sIdx, oIdx, btn) => {
    const stage = electionStages[sIdx];
    const feedback = btn.parentElement.nextElementSibling;
    const allBtns = btn.parentElement.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);
    if (oIdx === stage.quiz.answer) {
        btn.classList.add('correct');
        feedback.innerHTML = "&#9989; Correct! Great job.";
        feedback.style.color = "#10b981";
    } else {
        btn.classList.add('incorrect');
        allBtns[stage.quiz.answer].classList.add('correct');
        feedback.innerHTML = "&#10060; Incorrect. Keep learning!";
        feedback.style.color = "#ef4565";
    }
    feedback.classList.remove('hidden');
    trackEvent("quiz_answered", {
        stage: stage.id,
        correct: oIdx === stage.quiz.answer,
    });
};

const setupMinimizeLogic = () => {
    const sidebar = document.getElementById('ai-sidebar');
    const toggleBtn = document.getElementById('toggle-chat-btn');
    const headerContent = document.querySelector('.ai-header-content');
    if (!sidebar || !toggleBtn || !headerContent) return;

    const toggleMinimize = () => {
        sidebar.classList.toggle('minimized');
        toggleBtn.innerText = sidebar.classList.contains('minimized') ? '+' : '−';
        toggleBtn.setAttribute('aria-expanded', String(!sidebar.classList.contains('minimized')));
    };
    toggleBtn.onclick = toggleMinimize;
    headerContent.onclick = () => {
        if (sidebar.classList.contains('minimized')) toggleMinimize();
    };
};

export const updateStageUI = (stageId, progress = null) => {
    const stageIndex = electionStages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) return;
    currentStageContext = electionStages[stageIndex];
    const scrollContainer = document.getElementById('stages-scroll-container');
    const card = document.getElementById('context-display');
    const stageItems = document.querySelectorAll('#stage-list li');
    if (scrollContainer && card && progress !== null) {
        const totalHeight = scrollContainer.scrollHeight;
        const viewportHeight = card.offsetHeight;
        const maxScroll = totalHeight - viewportHeight;
        const translateY = progress * maxScroll;
        scrollContainer.style.transform = `translateY(-${translateY}px)`;
    }
    stageItems.forEach((item, idx) => {
        if (idx === stageIndex) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'step');
        } else {
            item.classList.remove('active');
            item.setAttribute('aria-current', 'false');
        }
    });
};

const initTimeline = () => {
    const list = document.getElementById('stage-list');
    if (!list) return;

    list.innerHTML = '';
    electionStages.forEach(stage => {
        const li = document.createElement('li');
        li.innerText = stage.title;
        li.dataset.id = stage.id;
        li.setAttribute('aria-current', 'false');
        list.appendChild(li);
    });
};

const renderSuggestions = (suggestions = demoQueries) => {
    const container = document.getElementById('suggestions');
    if (!container) return;
    container.innerHTML = '';
    suggestions.forEach(scenario => {
        const tag = document.createElement('span');
        tag.className = 'suggest-tag';
        tag.innerText = scenario;
        tag.setAttribute('role', 'listitem');
        tag.setAttribute('tabindex', '0');
        tag.setAttribute('aria-label', `Ask: ${scenario}`);

        const askSuggestedQuestion = () => {
            const activeOpt = document.querySelector('.lang-opt.active');
            const lang = activeOpt ? activeOpt.dataset.lang : "hinglish";
            handleUserQuery(scenario, lang);
        };

        tag.onclick = askSuggestedQuestion;
        tag.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                askSuggestedQuestion();
            }
        };
        container.appendChild(tag);
    });
};

const setupChatLogic = () => {
    const sendBtn = document.getElementById('send-btn');
    const inputField = document.getElementById('user-query');
    const langSelector = document.querySelector('.lang-selector');
    if (!sendBtn || !inputField) return;

    if (langSelector) {
        const activateLanguage = (opt) => {
            if (!opt) return;
            const opts = langSelector.querySelectorAll('.lang-opt');
            opts.forEach(o => {
                o.classList.remove('active');
                o.setAttribute('aria-checked', 'false');
            });
            opt.classList.add('active');
            opt.setAttribute('aria-checked', 'true');
            trackEvent("language_changed", { language: opt.dataset.lang });
        };

        langSelector.onclick = (e) => activateLanguage(e.target.closest('.lang-opt'));
        langSelector.onkeydown = (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const opt = e.target.closest('.lang-opt');
            if (!opt) return;
            e.preventDefault();
            activateLanguage(opt);
        };
    }
    const triggerSend = () => {
        const query = inputField.value.trim();
        const activeOpt = document.querySelector('.lang-opt.active');
        const activeLang = activeOpt ? activeOpt.dataset.lang : "hinglish";
        if (query) {
            inputField.value = '';
            handleUserQuery(query, activeLang);
        }
    };
    sendBtn.onclick = triggerSend;
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') triggerSend();
    };
};

const addMessageToChat = (contentHtml, sender) => {
    const chatHistory = document.getElementById('ai-chat-history');
    if (!chatHistory) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    chatHistory.appendChild(msgDiv);
    if (sender === 'ai') {
        let i = 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const text = tempDiv.innerHTML;
        msgDiv.innerHTML = '';
        const type = () => {
            if (i < text.length) {
                if (text[i] === '<') {
                    const tagEnd = text.indexOf('>', i);
                    msgDiv.innerHTML += text.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                } else {
                    msgDiv.innerHTML += text[i];
                    i++;
                }
                chatHistory.scrollTop = chatHistory.scrollHeight;
                setTimeout(type, 10);
            }
        };
        type();
    } else {
        msgDiv.innerHTML = escapeHtml(contentHtml);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
};

const handleUserQuery = async (query, lang = "hinglish") => {
    addMessageToChat(query, 'user');
    trackEvent("mentor_question_submitted", {
        language: lang,
        stage: currentStageContext.id,
        query_length: query.length,
    });

    const loadingId = 'loading-' + Date.now();
    addMessageToChat(`<span id="${loadingId}">Analyzing with Sarvam [${escapeHtml(lang.toUpperCase())}]...</span>`, 'ai');
    try {
        const data = await getElectionIntelligence(query, currentStageContext, lang);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.parentElement.remove();
        addMessageToChat(createElectionResponseHtml(data), 'ai');
        if (data.suggested_followups && data.suggested_followups.length > 0) {
            renderSuggestions(data.suggested_followups.slice(0, 3));
        }
    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.innerText = "⚠️ Service temporarily busy. I'm an AI specialized in Indian Elections - try asking about Voter IDs or EVMs!";
            loadingEl.style.color = "#ef4565";
        }
    }
};
