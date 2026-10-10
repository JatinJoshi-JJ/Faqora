/* ========================================================
           1. LENIS SMOOTH MOMENTUM SCROLL ENGINE
           ======================================================== */
let lenis = null;
try {
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth Scroll for Internal Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId && targetId !== "#contact") {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -75, duration: 1.2 });
          }
        }
      });
    });
  }
} catch (e) {
  console.warn("Lenis smooth scroll initialized with standard fallback.", e);
}

/* ========================================================
           2. WEB AUDIO SYNTHESIZER
           ======================================================== */
let audioCtx = null;
let isAudioMuted = false;

function playChime(freq = 480, type = "sine", duration = 0.08, vol = 0.04) {
  if (isAudioMuted) return;
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function showToast(msg) {
  const toast = document.getElementById("toastPill");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ========================================================
           3. FAQ DATASET & SMOOTH ACCORDION LOGIC
           ======================================================== */
const faqData = [
  {
    id: "faq-01",
    category: "General",
    question: "How does FAQORA work?",
    answer:
      "FAQORA uses a simple and intuitive accordion interface to help you quickly find the information you need. You can browse by category, search for specific questions, or expand each item to read the full answer with fluid, zero-lag transitions.",
    tags: ["getting-started", "overview"],
  },
  {
    id: "faq-02",
    category: "General",
    question: "Will the content match our brand style?",
    answer:
      "Yes, absolutely. FAQORA is built using modular CSS custom property tokens. You can adjust colors, border radii, font pairings, and spacing scales in seconds to align seamlessly with any bespoke corporate design system.",
    tags: ["branding", "customization"],
  },
  {
    id: "faq-03",
    category: "Account",
    question: "How fast can we get our content live?",
    answer:
      "Implementation takes less than five minutes. Simply import our standalone file or configure the data JSON model, and your knowledge base will be fully operational across all desktop and mobile devices.",
    tags: ["deployment", "speed"],
  },
  {
    id: "faq-04",
    category: "Billing",
    question: "Is FAQORA suitable for businesses of all sizes?",
    answer:
      "Yes. Whether you are an early-stage startup, a boutique design atelier, or an enterprise-grade SaaS product, FAQORA scales smoothly to accommodate hundreds of categorized support documents.",
    tags: ["scaling", "pricing"],
  },
  {
    id: "faq-05",
    category: "Support",
    question: "Do you offer customer support?",
    answer:
      "Our customer success concierge is available around the clock. You can submit inquiries directly via our support modal or consult our interactive guides for real-time assistance.",
    tags: ["concierge", "help"],
  },
  {
    id: "faq-06",
    category: "Features",
    question: "Can I switch between single-open and multi-open modes?",
    answer:
      "Yes. Use the mode toggle pills situated just above the accordion stack to switch between strict single-open expansion (where opening an item closes all others) and multi-open exploration.",
    tags: ["accordion", "modes"],
  },
  {
    id: "faq-07",
    category: "Technical",
    question: "Is FAQORA fully accessible under WCAG 2.2 AA?",
    answer:
      "Yes. FAQORA includes full keyboard navigation (Tab, Enter, Space), screen-reader aria-expanded states, aria-controls relationships, and high-contrast visible focus indicators in both light and dark modes.",
    tags: ["accessibility", "a11y"],
  },
  {
    id: "faq-08",
    category: "Technical",
    question: "Does the search bar filter answers as well as titles?",
    answer:
      "Yes. The search algorithm evaluates both question titles and inner answer copy using case-insensitive keyword tokenization, ensuring you never miss a relevant solution.",
    tags: ["search", "indexing"],
  },
  {
    id: "faq-09",
    category: "Account",
    question: "How do I manage my team permissions and seats?",
    answer:
      "Team admins can invite members, assign role-based editorial privileges, and review search analytics directly from the central workspace management console.",
    tags: ["security", "teams"],
  },
  {
    id: "faq-10",
    category: "Billing",
    question: "What payment methods do you accept?",
    answer:
      "We support all major credit cards (Visa, Mastercard, American Express), digital wallets (Apple Pay, Google Pay), and ACH wire transfers for enterprise annual retainers.",
    tags: ["payments", "invoices"],
  },
  {
    id: "faq-11",
    category: "Features",
    question: "Does FAQORA support Dark Mode?",
    answer:
      "Yes. FAQORA includes a dedicated Midnight Editorial dark theme that respects your operating system preference and persists manual user selections via browser localStorage.",
    tags: ["dark-mode", "theme"],
  },
  {
    id: "faq-12",
    category: "Support",
    question: "Where can I report a bug or request a feature?",
    answer:
      "You can submit bug reports and feedback through our contact dialog, or consult our public GitHub repository issue tracker for active discussions.",
    tags: ["feedback", "roadmap"],
  },
];

let activeCategory = "All";
let searchQuery = "";
let isSingleOpenMode = true;
const openFaqIds = new Set(["faq-01"]);

const categories = [
  "All",
  "General",
  "Account",
  "Billing",
  "Features",
  "Technical",
  "Support",
];

function renderCategoryPills() {
  const container = document.getElementById("categoryPillsRow");
  container.innerHTML = categories
    .map((cat) => {
      const count =
        cat === "All"
          ? faqData.length
          : faqData.filter((f) => f.category === cat).length;
      const isActive = activeCategory === cat;
      return `
                    <button type="button" 
                            class="category-pill ${isActive ? "active" : ""}" 
                            data-category="${cat}"
                            role="tab"
                            aria-selected="${isActive}">
                        <span>${cat}</span>
                        <span class="category-count">${count}</span>
                    </button>
                `;
    })
    .join("");

  container.querySelectorAll(".category-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      renderCategoryPills();
      renderFaqAccordion();
      playChime(520, "sine", 0.06);
    });
  });
}

function getFilteredFaqs() {
  return faqData.filter((item) => {
    const matchesCat =
      activeCategory === "All" || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });
}

function renderFaqAccordion() {
  const container = document.getElementById("accordionStack");
  const items = getFilteredFaqs();
  const countLabel = document.getElementById("resultCountLabel");

  countLabel.textContent = `Showing ${items.length} question${items.length === 1 ? "" : "s"}`;

  if (items.length === 0) {
    container.innerHTML = `
                    <div style="text-align: center; padding: 3rem 1.5rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                        <div style="font-size: 2.2rem; margin-bottom: 0.8rem;">🔍</div>
                        <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; margin-bottom: 0.4rem;">No matching questions found</h3>
                        <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1.2rem;">Try different keywords or reset your category filters.</p>
                        <button type="button" class="btn-helpful" id="btnResetFilters" style="padding: 0.5rem 1.2rem;">Reset Filters</button>
                    </div>
                `;
    document
      .getElementById("btnResetFilters")
      ?.addEventListener("click", () => {
        activeCategory = "All";
        searchQuery = "";
        document.getElementById("faqSearchInput").value = "";
        renderCategoryPills();
        renderFaqAccordion();
      });
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const isOpen = openFaqIds.has(item.id);
      return `
                    <article class="faq-card ${isOpen ? "open" : ""}" id="card-${item.id}">
                        <button type="button" 
                                class="faq-header-trigger" 
                                aria-expanded="${isOpen}" 
                                aria-controls="answer-${item.id}"
                                data-id="${item.id}">
                            <span>${item.question}</span>
                            <span class="faq-icon-circle" aria-hidden="true">
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                                    <path d="M8 3v10M3 8h10"></path>
                                </svg>
                            </span>
                        </button>
                        <div class="faq-answer-collapse" id="answer-${item.id}">
                            <div class="faq-answer-inner">
                                <div class="faq-answer-content">
                                    <p>${item.answer}</p>
                                    <div class="faq-answer-footer">
                                        <span>Was this answer helpful?</span>
                                        <div class="helpful-buttons">
                                            <button type="button" class="btn-helpful" onclick="handleHelpfulClick('${item.id}', true)">Yes 👍</button>
                                            <button type="button" class="btn-helpful" onclick="handleHelpfulClick('${item.id}', false)">No 👎</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
    })
    .join("");

  container.querySelectorAll(".faq-header-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      toggleAccordionItem(id);
    });
  });
}

function toggleAccordionItem(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;

  const trigger = card.querySelector(".faq-header-trigger");
  const isCurrentlyOpen = openFaqIds.has(id);

  playChime(580, "sine", 0.08, 0.03);

  if (isCurrentlyOpen) {
    openFaqIds.delete(id);
    card.classList.remove("open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  } else {
    if (isSingleOpenMode) {
      openFaqIds.forEach((openId) => {
        const otherCard = document.getElementById(`card-${openId}`);
        if (otherCard && openId !== id) {
          otherCard.classList.remove("open");
          const otherTrigger = otherCard.querySelector(".faq-header-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });
      openFaqIds.clear();
    }
    openFaqIds.add(id);
    card.classList.add("open");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }
}

window.handleHelpfulClick = function (id, isHelpful) {
  playChime(isHelpful ? 640 : 380, "sine", 0.1);
  showToast(
    isHelpful
      ? "Thank you for your feedback! ✨"
      : "Thank you. We will improve this guide.",
  );
};

/* ========================================================
           4. 4D KINETIC PARTICLE TYPOGRAPHY & MORPH ENGINE
           ======================================================== */
const canvas = document.getElementById("heroParticleCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("canvasContainer");
const reticle = document.getElementById("particleReticle");

const quantumConfig = {
  text: "FAQORA",
  solver: "repel", // 'repel', 'vortex', 'liquid', 'wave'
  restitution: 0.12, // Hooke constant
  damping: 0.88, // Viscous friction
  blastRadius: 95,
  densityStep: 3, // High-res subpixel sampling
  pointSize: 1.6,
};

let pWidth = 0;
let pHeight = 0;
let dpr = 1;
const particles = [];
let particlesInitialized = false;

const pointer = {
  x: -1000,
  y: -1000,
  targetX: -1000,
  targetY: -1000,
  vx: 0,
  vy: 0,
  isOver: false,
};

const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

function resizeParticleCanvas() {
  const rect = container.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  pWidth = Math.floor(rect.width);
  pHeight = Math.floor(rect.height);

  canvas.width = pWidth * dpr;
  canvas.height = pHeight * dpr;
  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  rasterizeTypography(quantumConfig.text);
}

function rasterizeTypography(word) {
  if (!pWidth || !pHeight || pWidth <= 0 || pHeight <= 0) return;

  const canvasW = Math.floor(pWidth);
  const canvasH = Math.floor(pHeight);

  offCanvas.width = canvasW;
  offCanvas.height = canvasH;
  offCtx.clearRect(0, 0, canvasW, canvasH);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  offCtx.fillStyle = "#FFFFFF";

  // Auto-scale font size dynamically based on word length so custom text never clips
  const cleanWord =
    word && word.trim().length > 0 ? word.toUpperCase() : "FAQORA";
  let fontSize = Math.min(canvasH * 0.52, 88);
  offCtx.font = `800 ${fontSize}px "Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif`;
  offCtx.letterSpacing = "4px";

  let textWidth = offCtx.measureText(cleanWord).width;
  const maxAllowedWidth = canvasW * 0.88;

  if (textWidth > maxAllowedWidth && textWidth > 0) {
    fontSize = Math.max(
      20,
      Math.floor(fontSize * (maxAllowedWidth / textWidth)),
    );
    offCtx.font = `800 ${fontSize}px "Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif`;
    offCtx.letterSpacing = fontSize > 36 ? "3px" : "1px";
  }

  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(cleanWord, canvasW / 2, canvasH / 2);

  const imgDataObj = offCtx.getImageData(0, 0, canvasW, canvasH);
  const imgData = imgDataObj.data;
  const imgW = imgDataObj.width;
  const step = Math.max(2, quantumConfig.densityStep);
  const newTargets = [];

  for (let y = 0; y < canvasH; y += step) {
    for (let x = 0; x < canvasW; x += step) {
      const idx = (y * imgW + x) * 4;
      if (imgData[idx + 3] > 128) {
        newTargets.push({
          x: x + (Math.random() - 0.5) * 1.5,
          y: y + (Math.random() - 0.5) * 1.5,
        });
      }
    }
  }

  // Theme color harmonics
  const primaryColor = isDark ? "#E6A18B" : "#7D2D1E";
  const secondaryColor = isDark ? "#F5EDE3" : "#241711";
  const targetCount = newTargets.length;

  for (let i = 0; i < targetCount; i++) {
    const target = newTargets[i];
    const col = i % 3 === 0 ? primaryColor : secondaryColor;

    if (i < particles.length) {
      particles[i].targetX = target.x;
      particles[i].targetY = target.y;
      particles[i].active = true;
      particles[i].color = col;
      particles[i].alpha = 1.0; // Guaranteed full opacity on re-targeting
      particles[i].size = quantumConfig.pointSize + Math.random() * 0.8;
    } else {
      particles.push({
        x: canvasW / 2 + (Math.random() - 0.5) * 150,
        y: canvasH / 2 + (Math.random() - 0.5) * 80,
        targetX: target.x,
        targetY: target.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: quantumConfig.pointSize + Math.random() * 0.8,
        color: col,
        alpha: 1.0,
        active: true,
      });
    }
  }

  // Excess particles become inactive and float outward
  for (let i = targetCount; i < particles.length; i++) {
    particles[i].active = false;
    particles[i].vx = (Math.random() - 0.5) * 5;
    particles[i].vy = (Math.random() - 0.5) * 5;
  }

  document.getElementById("telemetryNodes").textContent =
    targetCount.toLocaleString();
  particlesInitialized = true;
  playChime(540, "sine", 0.1, 0.05);
}

let simTime = 0;
const shockwaves = [];

function triggerRadialImpulse(x, y, force = 28) {
  shockwaves.push({
    x,
    y,
    radius: 10,
    maxRadius: 380,
    amplitude: force,
    decay: 0.95,
  });

  particles.forEach((p) => {
    if (!p.active) return;
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist < 260) {
      const impact = (1 - dist / 260) * force;
      const angle = Math.atan2(dy, dx);
      p.vx += Math.cos(angle) * impact;
      p.vy += Math.sin(angle) * impact;
    }
  });

  playChime(220, "triangle", 0.2, 0.08);
}

function renderQuantumLoop() {
  simTime += 0.02;

  // Low-pass smooth pointer interpolation
  const prevX = pointer.x;
  const prevY = pointer.y;
  pointer.x += (pointer.targetX - pointer.x) * 0.16;
  pointer.y += (pointer.targetY - pointer.y) * 0.16;
  pointer.vx = pointer.x - prevX;
  pointer.vy = pointer.y - prevY;

  // Reticle Follower
  if (pointer.isOver) {
    reticle.style.left = `${pointer.x}px`;
    reticle.style.top = `${pointer.y}px`;
    reticle.style.opacity = "0.8";
  } else {
    reticle.style.opacity = "0";
  }

  ctx.clearRect(0, 0, pWidth, pHeight);

  const k = quantumConfig.restitution;
  const damping = quantumConfig.damping;
  const blastR = quantumConfig.blastRadius;

  particles.forEach((p) => {
    if (!p.active) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= 0.95;
      if (p.alpha > 0.05) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // If active particle was previously fading, restore to 100% opacity
    if (p.alpha < 1.0) {
      p.alpha = Math.min(1.0, p.alpha + 0.1);
    }

    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy);

    // Multi-Solver Physics Modes
    if (dist < blastR && pointer.isOver) {
      const forceRatio = 1 - dist / blastR;

      if (quantumConfig.solver === "repel") {
        const angle = Math.atan2(dy, dx);
        const push = forceRatio * 18;
        p.vx -= Math.cos(angle) * push;
        p.vy -= Math.sin(angle) * push;
      } else if (quantumConfig.solver === "vortex") {
        const angle = Math.atan2(dy, dx);
        const pull = forceRatio * 7;
        const spin = forceRatio * 15;
        p.vx += Math.cos(angle) * pull - Math.sin(angle) * spin;
        p.vy += Math.sin(angle) * pull + Math.cos(angle) * spin;
      } else if (quantumConfig.solver === "liquid") {
        p.vy += forceRatio * 8.5; // Downward gravity drip
        p.vx += (Math.random() - 0.5) * forceRatio * 12;
      } else if (quantumConfig.solver === "wave") {
        p.vy += Math.sin(simTime * 5 + p.x * 0.03) * forceRatio * 10;
      }
    }

    // Hooke's Elastic Restitution Spring
    const springX = (p.targetX - p.x) * k;
    const springY = (p.targetY - p.y) * k;

    p.vx = (p.vx + springX) * damping;
    p.vy = (p.vy + springY) * damping;

    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Propagate Shockwave Impulse Rings
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += 10;
    sw.amplitude *= sw.decay;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "#E6A18B"
        : "#7D2D1E";
    ctx.lineWidth = Math.max(0.6, sw.amplitude * 0.1);
    ctx.globalAlpha = Math.min(0.7, sw.amplitude / 28);
    ctx.stroke();
    ctx.restore();

    if (sw.radius > sw.maxRadius || sw.amplitude < 0.2) {
      shockwaves.splice(i, 1);
    }
  }

  // Update Telemetry Velocity
  const speed = Math.hypot(pointer.vx, pointer.vy);
  document.getElementById("telemetrySpeed").textContent =
    `${Math.round(speed * 35)} px/s`;

  requestAnimationFrame(renderQuantumLoop);
}

// Pointer event listeners on canvas container
container.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.targetX = e.clientX - rect.left;
  pointer.targetY = e.clientY - rect.top;
  pointer.isOver = true;
});

container.addEventListener("mouseleave", () => {
  pointer.isOver = false;
  pointer.targetX = -1000;
  pointer.targetY = -1000;
});

container.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  triggerRadialImpulse(e.clientX - rect.left, e.clientY - rect.top, 36);
  reticle.classList.add("active");
  setTimeout(() => reticle.classList.remove("active"), 250);
});

const ro = new ResizeObserver(() => resizeParticleCanvas());
ro.observe(container);

/* ========================================================
           5. EVENT LISTENERS & USER CONTROLS
           ======================================================== */
// Custom Morph Word Input
const customMorphInput = document.getElementById("customMorphInput");
customMorphInput.addEventListener("input", (e) => {
  const word = e.target.value;
  if (word.trim().length > 0) {
    quantumConfig.text = word;
    rasterizeTypography(word);
  }
});

// Disperse Button
document.getElementById("btnTriggerBlast").addEventListener("click", () => {
  triggerRadialImpulse(pWidth / 2, pHeight / 2, 42);
  showToast("Particle Matrix Dispersed! 💥");
});

// Preset Chips
const presetChips = document.querySelectorAll(".preset-chip");
presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const word = chip.getAttribute("data-word");
    customMorphInput.value = word;
    quantumConfig.text = word;
    presetChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    rasterizeTypography(word);
  });
});

// Physics Solver Mode Buttons
const solverBtns = document.querySelectorAll(".btn-solver");
solverBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const solver = btn.getAttribute("data-solver");
    quantumConfig.solver = solver;
    solverBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    playChime(420, "triangle", 0.1, 0.05);
    showToast(`Solver Active: ${btn.textContent.trim()}`);
  });
});

// Search Input Listener
const searchInput = document.getElementById("faqSearchInput");
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderFaqAccordion();
});

document.getElementById("btnSearchAction").addEventListener("click", () => {
  renderFaqAccordion();
  playChime(480, "sine", 0.06);
});

// Keyboard Shortcut: '/' to focus search
window.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement !== searchInput &&
    document.activeElement !== customMorphInput
  ) {
    e.preventDefault();
    searchInput.focus();
    showToast("Search focused! Press Escape to exit.");
  }
  if (e.key === "Escape") {
    if (document.getElementById("supportModal").classList.contains("open")) {
      closeSupportModal();
    } else if (document.activeElement === searchInput) {
      searchInput.blur();
    }
  }
});

// Mode Toggles (Single vs Multi Open)
const btnSingle = document.getElementById("btnSingleMode");
const btnMulti = document.getElementById("btnMultiMode");

btnSingle.addEventListener("click", () => {
  isSingleOpenMode = true;
  btnSingle.classList.add("active");
  btnMulti.classList.remove("active");
  if (openFaqIds.size > 1) {
    const first = Array.from(openFaqIds)[0];
    openFaqIds.clear();
    if (first) openFaqIds.add(first);
    renderFaqAccordion();
  }
  playChime(500, "sine", 0.05);
  showToast("Single-Item Accordion Mode Active");
});

btnMulti.addEventListener("click", () => {
  isSingleOpenMode = false;
  btnMulti.classList.add("active");
  btnSingle.classList.remove("active");
  playChime(540, "sine", 0.05);
  showToast("Multi-Item Accordion Mode Active");
});

// Theme Toggle
const btnTheme = document.getElementById("btnThemeToggle");
const themeIcon = document.getElementById("themeIcon");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("faqora-theme", theme);
  if (pWidth > 0) rasterizeTypography(quantumConfig.text);
}

btnTheme.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const target = current === "dark" ? "light" : "dark";
  setTheme(target);
  playChime(target === "dark" ? 360 : 680, "sine", 0.08);
  showToast(`Switched to ${target.toUpperCase()} Mode`);
});

// Audio Toggle
const btnAudio = document.getElementById("btnAudioToggle");
const audioIcon = document.getElementById("audioIcon");
btnAudio.addEventListener("click", () => {
  isAudioMuted = !isAudioMuted;
  audioIcon.textContent = isAudioMuted ? "🔇" : "🔊";
  if (!isAudioMuted) playChime(580, "sine", 0.08);
  showToast(isAudioMuted ? "Sound Effects Muted" : "Sound Effects Enabled");
});

// Support Modal Controls
const supportModal = document.getElementById("supportModal");
function openSupportModal() {
  supportModal.classList.add("open");
  playChime(600, "sine", 0.08);
}
function closeSupportModal() {
  supportModal.classList.remove("open");
}

document
  .getElementById("btnOpenSupportModal")
  .addEventListener("click", openSupportModal);
document.getElementById("navContactTrigger").addEventListener("click", (e) => {
  e.preventDefault();
  openSupportModal();
});
document
  .getElementById("footerContactTrigger")
  .addEventListener("click", (e) => {
    e.preventDefault();
    openSupportModal();
  });
document
  .getElementById("btnCloseModal")
  .addEventListener("click", closeSupportModal);
supportModal.addEventListener("click", (e) => {
  if (e.target === supportModal) closeSupportModal();
});

document
  .getElementById("supportContactForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    closeSupportModal();
    playChime(720, "sine", 0.15);
    showToast("Dispatch sent! Concierge will reply shortly ✨");
  });

// Restore Preferences on Initial Load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme =
    localStorage.getItem("faqora-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  setTheme(savedTheme);

  renderCategoryPills();
  renderFaqAccordion();
  renderQuantumLoop();

  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (pWidth > 0) rasterizeTypography(quantumConfig.text);
    });
  }
});
