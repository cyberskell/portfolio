/**
 * script.js
 * -----------------------------------------------------------------------
 * Handles: mobile nav toggle, footer year, contact form (mailto fallback),
 * and the FAQ chatbot (keyword-scored intent matching against
 * CHATBOT_INTENTS from chatbot-data.js).
 * -----------------------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  // ---- Footer year ----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Contact form (static-site friendly mailto fallback) ----
  // No backend is required for this to work. If you'd rather visitors
  // not need to open their mail client, swap this handler for a service
  // like Formspree or EmailJS — see README.md "Contact form" section.
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = "Please fill in every field before sending.";
        status.classList.remove("ok");
        return;
      }

      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:ehas2026@gmail.com?subject=${subject}&body=${body}`;

      status.textContent = "Opening your email app with this message pre-filled…";
      status.classList.add("ok");
    });
  }

  initChatbot();
  initScrollReveal();
  initScrollSpy();
});

/* =========================================================
   Scroll reveal — fades/slides sections and cards into view
   ========================================================= */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* =========================================================
   Scroll spy — highlights the current section in the nav
   ========================================================= */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const linkFor = (id) => document.querySelector(`.nav-links a[href="#${id}"]`);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          const link = linkFor(entry.target.id);
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* =========================================================
   Chatbot
   ========================================================= */
function initChatbot() {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  const body = document.getElementById("chat-body");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const suggestionsWrap = document.getElementById("chat-suggestions");

  if (!toggle || !panel) return;

  let opened = false;

  const openPanel = () => {
    panel.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    if (!opened) {
      addMessage(
        "bot",
        "Hi, I'm Ethan's portfolio assistant. Ask me anything about his skills, projects, experience, or how to reach him."
      );
      renderSuggestions();
      opened = true;
    }
    input.focus();
  };

  const closePanel = () => {
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = text; // textContent — never innerHTML — avoids any injected markup
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function renderSuggestions() {
    suggestionsWrap.innerHTML = "";
    CHATBOT_SUGGESTIONS.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = text;
      btn.addEventListener("click", () => handleUserMessage(text));
      suggestionsWrap.appendChild(btn);
    });
  }

  /**
   * Very small bag-of-keywords intent scorer.
   * Splits the message into tokens, checks each intent's keyword list
   * (single words or short phrases) against both the raw message and the
   * token set, and returns the highest-scoring intent above a threshold.
   * This is intentionally simple and dependency-free — it's not full NLP,
   * but it approximates intent matching well enough for an FAQ bot.
   */
  function matchIntent(message) {
    // pad with spaces so \b-free boundary checks below stay simple
    const clean = " " + message.toLowerCase().replace(/[^a-z0-9\s/]/g, " ").replace(/\s+/g, " ").trim() + " ";
    const tokens = clean.trim().split(/\s+/).filter(Boolean);
    const tokenSet = new Set(tokens);

    let best = null;
    let bestScore = 0;

    for (const intent of CHATBOT_INTENTS) {
      let score = 0;
      for (const kw of intent.keywords) {
        if (kw.includes(" ")) {
          // phrase match with real word boundaries (spaces on both sides),
          // so "what are you" won't accidentally match inside "what are your"
          if (clean.includes(" " + kw + " ")) score += (intent.weight || 1) * 2;
        } else if (tokenSet.has(kw)) {
          score += intent.weight || 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }

    return bestScore > 0 ? best : null;
  }

  function handleUserMessage(text) {
    addMessage("user", text);
    const intent = matchIntent(text);
    const reply = intent ? intent.response : CHATBOT_FALLBACK;
    // tiny delay makes it read as a considered reply rather than an instant lookup
    setTimeout(() => addMessage("bot", reply), 300);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUserMessage(text);
  });
}
