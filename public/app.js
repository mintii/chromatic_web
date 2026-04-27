const messagesEl = document.getElementById("messages");
const inputEl    = document.getElementById("input");
const sendBtn    = document.getElementById("send-btn");
const summaryEl  = document.getElementById("summary-content");
const newSessionBtn = document.getElementById("new-session-btn");

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = text;
  div.appendChild(bubble);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function setLoading(loading) {
  sendBtn.disabled = loading;
  inputEl.disabled = loading;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  autoResize();
  appendMessage("user", text);

  const loadingEl = appendMessage("agent loading", "Thinking…");
  setLoading(true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    loadingEl.remove();

    if (!res.ok) {
      appendMessage("agent", `Error: ${data.error || res.statusText}`);
    } else {
      appendMessage("agent", data.response);
      summaryEl.textContent = data.summary;
    }
  } catch (err) {
    loadingEl.remove();
    appendMessage("agent", `Network error: ${err.message}`);
  } finally {
    setLoading(false);
    inputEl.focus();
  }
}

async function newSession() {
  try {
    await fetch("/reset", { method: "POST" });
  } catch (_) {}

  messagesEl.innerHTML = "";
  appendMessage("agent", "Session reset. What would you like to explore?");
  summaryEl.textContent = "No topics explored yet in this session.";
}

function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = `${inputEl.scrollHeight}px`;
}

sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener("input", autoResize);
newSessionBtn.addEventListener("click", newSession);

inputEl.focus();
