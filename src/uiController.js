import { electionStages } from './electionData.js';
import { getElectionIntelligence } from './aiService.js';

let currentStageContext = "General Overview";

const demoQueries = [
    "What happens if NOTA wins?",
    "EVM kaise kaam karta hai?",
    "What if a candidate dies before results?"
];

// Audio System Removed as requested

export const initUI = () => {
    initTimeline();
    renderAllStages();
    renderSuggestions();
    setupChatLogic();
    setupMinimizeLogic();
    setupWorkflowLogic();
    setupBadgeLogic(); // New: Use event listener instead of onclick
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
        badgeBtn.innerText = "✨ Badge Claimed!";
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
    
    playSound('pop');
};

const setupWorkflowLogic = () => {
    const btn = document.getElementById('workflow-btn');
    const modal = document.getElementById('workflow-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (btn && modal && closeBtn) {
        btn.onclick = () => modal.classList.remove('hidden');
        closeBtn.onclick = () => modal.classList.add('hidden');
        
        // Close on clicking outside the content
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };
    }
};

const renderAllStages = () => {
    const container = document.getElementById('stages-scroll-container');
    if(!container) return;
    
    container.innerHTML = '';
    electionStages.forEach((stage, sIdx) => {
        const block = document.createElement('div');
        block.className = 'stage-block';
        block.id = `block-${stage.id}`;
        
        let detailsHtml = '';
        if (stage.details && stage.details.length > 0) {
            detailsHtml = `<ul class="stage-details-list">
                ${stage.details.map(d => `<li>${d}</li>`).join('')}
            </ul>`;
        }

        let quizHtml = '';
        if (stage.quiz) {
            quizHtml = `
                <div class="quiz-section glass">
                    <h4>📝 Quick Quiz</h4>
                    <p class="quiz-q">${stage.quiz.question}</p>
                    <div class="quiz-options">
                        ${stage.quiz.options.map((opt, oIdx) => `
                            <button class="quiz-opt-btn" onclick="window.checkAnswer(${sIdx}, ${oIdx}, this)">${opt}</button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback hidden"></div>
                </div>
            `;
        }

        block.innerHTML = `
            <h2>${stage.title}</h2>
            <p>${stage.description}</p>
            ${detailsHtml}
            ${quizHtml}
        `;
        container.appendChild(block);
    });

    // Attach quiz handler to window for easy access from string-template HTML
    window.checkAnswer = (sIdx, oIdx, btn) => {
        const stage = electionStages[sIdx];
        const feedback = btn.parentElement.nextElementSibling;
        const allBtns = btn.parentElement.querySelectorAll('.quiz-opt-btn');
        
        allBtns.forEach(b => b.disabled = true);
        
        if (oIdx === stage.quiz.answer) {
            btn.classList.add('correct');
            feedback.innerText = "✅ Correct! Great job.";
            feedback.style.color = "#10b981";
        } else {
            btn.classList.add('incorrect');
            allBtns[stage.quiz.answer].classList.add('correct');
            feedback.innerText = "❌ Incorrect. Keep learning!";
            feedback.style.color = "#ef4565";
        }
        feedback.classList.remove('hidden');
    };
};

const setupMinimizeLogic = () => {
    const sidebar = document.getElementById('ai-sidebar');
    const toggleBtn = document.getElementById('toggle-chat-btn');
    const headerContent = document.querySelector('.ai-header-content');

    const toggleMinimize = () => {
        sidebar.classList.toggle('minimized');
        toggleBtn.innerText = sidebar.classList.contains('minimized') ? '+' : '−';
    };

    toggleBtn.onclick = toggleMinimize;
    
    // Also allow clicking the header when minimized to open it
    headerContent.onclick = () => {
        if (sidebar.classList.contains('minimized')) {
            toggleMinimize();
        }
    };
};

export const updateStageUI = (stageId, progress = null) => {
    const stageIndex = electionStages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) return;
    
    currentStageContext = electionStages[stageIndex].title;

    const scrollContainer = document.getElementById('stages-scroll-container');
    const card = document.getElementById('context-display');
    const stageItems = document.querySelectorAll('#stage-list li');

    // True Scroll Sync Logic
    if(scrollContainer && card && progress !== null) {
        const totalHeight = scrollContainer.scrollHeight;
        const viewportHeight = card.offsetHeight;
        const maxScroll = totalHeight - viewportHeight;
        
        // Map progress (0-1) to the entire scrollable content
        const translateY = progress * maxScroll;
        scrollContainer.style.transform = `translateY(-${translateY}px)`;
    }

    // Update active state in nav
    stageItems.forEach((item, idx) => {
        if (idx === stageIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
};

const initTimeline = () => {
    const list = document.getElementById('stage-list');
    list.innerHTML = '';
    electionStages.forEach(stage => {
        const li = document.createElement('li');
        li.innerText = stage.title;
        li.dataset.id = stage.id;
        list.appendChild(li);
    });
};

const renderSuggestions = (suggestions = demoQueries) => {
    const container = document.getElementById('suggestions');
    container.innerHTML = '';
    suggestions.forEach(scenario => {
        const tag = document.createElement('span');
        tag.className = 'suggest-tag';
        tag.innerText = scenario;
        tag.onclick = () => handleUserQuery(scenario);
        container.appendChild(tag);
    });
};

const setupChatLogic = () => {
    const sendBtn = document.getElementById('send-btn');
    const inputField = document.getElementById('user-query');
    const langSelector = document.querySelector('.lang-selector');

    if (langSelector) {
        langSelector.onclick = (e) => {
            const opt = e.target.closest('.lang-opt');
            if (!opt) return;
            
            const opts = langSelector.querySelectorAll('.lang-opt');
            opts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
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
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    chatHistory.appendChild(msgDiv);
    
    if (sender === 'ai') {
        // Typewriter effect for AI
        let i = 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const text = tempDiv.innerHTML;
        msgDiv.innerHTML = '';
        
        const type = () => {
            if (i < text.length) {
                // Handle HTML tags correctly during typing
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
        msgDiv.innerHTML = contentHtml;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
};

const handleUserQuery = async (query, lang = "hinglish") => {
    // 1. Show User Message
    addMessageToChat(query, 'user');
    
    // 2. Show Loading
    const loadingId = 'loading-' + Date.now();
    addMessageToChat(`<span id="${loadingId}">Analyzing with Sarvam [${lang.toUpperCase()}]...</span>`, 'ai');

    // 3. Fetch AI Response
    try {
        const data = await getElectionIntelligence(query, currentStageContext, lang);

        // 4. Remove Loading
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.parentElement.remove();

        // 5. Render AI Response from JSON
        let responseHtml = `<div class="ai-source-indicator" style="font-size: 0.7rem; color: var(--primary); text-transform: uppercase; margin-bottom: 8px;">Powered by: ${data.source || 'Sarvam AI'}</div>`;
        responseHtml += `<strong>${data.title}</strong><br/><br/>`;
        responseHtml += `${data.explanation}<br/><br/>`;
        responseHtml += `<em>Example/Impact:</em> ${data.example_or_impact}<br/><br/>`;
        
        if (data.reasoning_summary) {
            responseHtml += `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 0.85rem;">
                <strong>🧠 Why this answer?</strong><br/>
                ${data.reasoning_summary}
            </div><br/>`;
        }

        responseHtml += `<strong>Conclusion:</strong> ${data.conclusion}`;

        addMessageToChat(responseHtml, 'ai');

        // 6. Update Suggestions
        if (data.suggested_followups && data.suggested_followups.length > 0) {
            renderSuggestions(data.suggested_followups.slice(0, 3));
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("AI Error:", error);
        }
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) {
            loadingEl.innerText = "⚠️ Service temporarily busy. I'm an AI specialized in Indian Elections—try asking about Voter IDs or EVMs!";
            loadingEl.style.color = "#ef4565";
        }
    }
};
