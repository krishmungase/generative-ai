// ── Markdown setup ──
marked.use({ breaks: true, gfm: true });

function renderMarkdown(text) {
    let html;
    try { html = marked.parse(text); }
    catch(e) { html = `<p>${text}</p>`; }
    const div = document.createElement("div");
    div.className = "md";
    div.innerHTML = html;
    div.querySelectorAll("pre code").forEach(b => hljs.highlightElement(b));
    return div;
}

// ── Badge maps ──
const topicMeta = {
    dsa:        { label: "DSA",           cls: "badge-dsa"        },
    javascript: { label: "JavaScript",    cls: "badge-javascript" },
    sysdesign:  { label: "System Design", cls: "badge-sysdesign"  },
    general:    { label: "General CS",    cls: "badge-general"    },
};
const levelMeta = {
    beginner:     { label: "Beginner",     cls: "badge-beginner"     },
    intermediate: { label: "Intermediate", cls: "badge-intermediate" },
    advanced:     { label: "Advanced",     cls: "badge-advanced"     },
};

const chatArea   = document.getElementById("chat-area");
const welcome    = document.getElementById("welcome");
const chatSpacer = chatArea.querySelector(".chat-spacer");
let conversationStarted = false;

// ── Scroll to bottom ──
function scrollBottom() {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
}

// ── Hide welcome screen on first message ──
function ensureChatStarted() {
    if (!conversationStarted) {
        welcome.classList.add("hidden");
        conversationStarted = true;
    }
}

// ── Append user message bubble ──
function appendUserMessage(text) {
    ensureChatStarted();
    const row = document.createElement("div");
    row.className = "msg-row user";
    row.innerHTML = `<div class="bubble user">${escapeHtml(text)}</div>`;
    chatArea.insertBefore(row, chatSpacer);
    scrollBottom();
}

// ── Append typing indicator ──
let typingRow = null;
function showTyping() {
    typingRow = document.createElement("div");
    typingRow.className = "msg-row agent";
    typingRow.innerHTML = `
        <div class="agent-avatar">✦</div>
        <div class="typing-bubble">
            <div class="t-dot"></div>
            <div class="t-dot"></div>
            <div class="t-dot"></div>
        </div>`;
    chatArea.insertBefore(typingRow, chatSpacer);
    scrollBottom();
}
function removeTyping() {
    if (typingRow) { typingRow.remove(); typingRow = null; }
}

// ── Append AI answer bubble ──
function appendAgentMessage(data) {
    const row = document.createElement("div");
    row.className = "msg-row agent";

    // Avatar
    const avatar = document.createElement("div");
    avatar.className = "agent-avatar";
    avatar.textContent = "✦";

    // Bubble
    const bubble = document.createElement("div");
    bubble.className = "bubble agent";

    // Header with badges + copy
    const tm = topicMeta[data.topic] || { label: data.topic || "CS", cls: "badge-general" };
    const lm = levelMeta[data.level] || { label: data.level  || "", cls: "badge-beginner" };

    const header = document.createElement("div");
    header.className = "bubble-header";
    header.innerHTML = `
        <div class="bubble-meta">
            <span class="badge ${tm.cls}">${tm.label}</span>
            ${lm.label ? `<span class="badge ${lm.cls}">${lm.label}</span>` : ""}
        </div>
        <button class="btn-copy">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor"/><path d="M2 8V2h6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Copy
        </button>`;

    // Copy handler
    header.querySelector(".btn-copy").addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        try {
            await navigator.clipboard.writeText(data.answer);
            btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.5l3 3 5-5" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!`;
            btn.style.color = "#10b981";
            setTimeout(() => {
                btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor"/><path d="M2 8V2h6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg> Copy`;
                btn.style.color = "";
            }, 2000);
        } catch (_) {}
    });

    const mdEl = renderMarkdown(data.answer);

    bubble.appendChild(header);
    bubble.appendChild(mdEl);
    row.appendChild(avatar);
    row.appendChild(bubble);
    chatArea.insertBefore(row, chatSpacer);
    scrollBottom();
}

// ── Append error bubble ──
function appendErrorMessage(msg) {
    const row = document.createElement("div");
    row.className = "msg-row agent";
    row.innerHTML = `
        <div class="agent-avatar" style="background:linear-gradient(135deg,#ef4444,#f97316)">⚠</div>
        <div class="bubble agent" style="border-color:rgba(239,68,68,.2);background:rgba(255,240,240,.9)">
            <p style="color:#dc2626;font-weight:600;font-size:.85rem">Something went wrong</p>
            <p style="color:#ef4444;font-size:.78rem;margin-top:.25rem">${escapeHtml(msg)}</p>
        </div>`;
    chatArea.insertBefore(row, chatSpacer);
    scrollBottom();
}

// ── Status pill ──
function setStatus(state) {
    const dot = document.getElementById("status-dot");
    const lbl = document.getElementById("status-label");
    const btn = document.getElementById("submit-btn");
    if (state === "loading") {
        dot.className = "dot-amber"; lbl.textContent = "Thinking…"; btn.disabled = true;
    } else {
        dot.className = "dot-green"; lbl.textContent = "Ready"; btn.disabled = false;
    }
}

// ── Auto-resize textarea ──
const textarea = document.getElementById("question-input");
textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
});

// Send on Enter (Shift+Enter = newline)
textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("ask-form").requestSubmit();
    }
});

// ── Form submit ──
document.getElementById("ask-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = textarea.value.trim();
    if (!question) { textarea.focus(); return; }

    textarea.value = "";
    textarea.style.height = "auto";

    appendUserMessage(question);
    setStatus("loading");
    showTyping();

    try {
        const res  = await fetch("/api/ask", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ question }),
        });
        const data = await res.json();
        removeTyping();

        if (!res.ok) { appendErrorMessage(data.error || "Unknown error."); }
        else         { appendAgentMessage(data); }

    } catch (err) {
        removeTyping();
        appendErrorMessage(err.message);
    }

    setStatus("idle");
    textarea.focus();
});

// ── Chip click (welcome + footer) ──
document.querySelectorAll(".chip, .hint-chip").forEach(btn => {
    btn.addEventListener("click", () => {
        textarea.value = btn.dataset.chip;
        textarea.dispatchEvent(new Event("input")); // resize
        textarea.focus();
    });
});

// ── Escape HTML helper ──
function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
