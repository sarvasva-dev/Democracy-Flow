import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { initUI, updateStageUI } from "./src/uiController.js";
import { electionStages } from "./src/electionData.js";
import './style.css';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger); 

// Initialize Chat and UI
initUI();

// ----------------------------------------------------
// Canvas Animation Logic (Retained from original)
// ----------------------------------------------------
const canvas = document.querySelector('.canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');
const frameCount = 179;

const currentFrame = (index) => `/optimized_blender_imgs/${(index + 1).toString()}.webp`;
const images = [];
let ball = { frame: 0 };

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// Ensure first image loads
if(images.length > 0) {
    images[0].onload = render;
}

function render() {
  if(!images[0] || !images[ball.frame]) return;
  context.canvas.width = images[0].width;
  context.canvas.height = images[0].height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images[ball.frame], 0, 0);
}

// Master Timeline for Canvas
gsap.to(ball, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    scrub: 0.5,
    pin: "canvas",
    end: "500%", 
    onUpdate: (self) => {
        // Sync stages perfectly with scroll progress (0 to 1)
        const progress = self.progress;
        
        // DOM Elements
        const scrollPrompt = document.getElementById('scroll-prompt');
        const contextCard = document.getElementById('context-display');
        const timeline = document.querySelector('.timeline-nav');
        const hero = document.querySelector('.hero');
        const finale = document.getElementById('finale');
        const sidebar = document.getElementById('ai-sidebar');

        // Initial landing state vs scrolling state (Reveals at 5% scroll)
        if (progress > 0.05) {
            if(scrollPrompt) {
                scrollPrompt.classList.add('hidden');
            }
            if(hero) hero.classList.add('scrolled');
            if(contextCard) contextCard.classList.remove('hidden');
            if(timeline) timeline.classList.remove('hidden');
            if(sidebar) sidebar.classList.remove('hidden');
        } else {
            if(scrollPrompt) {
                scrollPrompt.classList.remove('hidden');
            }
            if(hero) hero.classList.remove('scrolled');
            if(contextCard) contextCard.classList.add('hidden');
            if(timeline) timeline.classList.add('hidden');
            if(sidebar) sidebar.classList.add('hidden');
        }

        // Handle Finale visibility
        if (progress > 0.92) {
            if(finale) finale.classList.add('active');
            if(sidebar) { sidebar.style.opacity = '0'; sidebar.style.pointerEvents = 'none'; }
            if(contextCard) contextCard.style.opacity = '0';
            if(timeline) timeline.style.opacity = '0';
        } else {
            if(finale) finale.classList.remove('active');
            if(sidebar) { sidebar.style.opacity = '1'; sidebar.style.pointerEvents = 'all'; }
            if(contextCard) contextCard.style.opacity = '1';
            if(timeline) timeline.style.opacity = '1';
        }

        const stageIndex = Math.min(
            Math.floor(progress * electionStages.length),
            electionStages.length - 1
        );
        updateStageUI(electionStages[stageIndex].id, progress);
    }
  },
  onUpdate: render,
});

// Remove old standalone scroll triggers since we handle it in the main timeline now

// Initialize first stage
if(electionStages.length > 0) {
    updateStageUI(electionStages[0].id);
}

// Handle window resize for canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
});