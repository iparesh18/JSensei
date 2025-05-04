const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");



function animateButtonClick(button) {
  button.classList.add("clicked");
  setTimeout(() => {
    button.classList.remove("clicked");
  }, 150);
}

function addMessage(content, role = "bot") {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerHTML = formatContent(content);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  attachCopyListeners(); // Reattach copy listeners after content is added
}

function formatContent(text) {
  return text
    .replace(/```(.*?)```/gs, (_, code) => {
      return `<div class="code-block">
                <button class="copy-btn">Copy</button>
                <pre><code>${code.trim()}</code></pre>
              </div>`;
    })
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/(Bronze|Gold|Diamond)/gi, (match) => {
      return `<span class="badge ${match.toLowerCase()}">Difficulty - ${match}</span>`;
    });
}

function attachCopyListeners() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.onclick = () => {
      // Find the code block to copy
      const codeBlock = btn.closest(".code-block").querySelector("pre code");
      const code = codeBlock.textContent || codeBlock.innerText;

      // Copy the code text to clipboard
      navigator.clipboard.writeText(code).then(() => {
        btn.innerText = "Copied!";
        setTimeout(() => (btn.innerText = "Copy"), 1500);
      }).catch(err => {
        console.error('Error copying text: ', err);
        btn.innerText = "Failed to Copy";
        setTimeout(() => (btn.innerText = "Copy"), 1500);
      });
    };
  });
}
async function getGPTResponse(prompt) {
  addMessage(prompt, "user");

  // Show typing loader in chat
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message bot typing-msg";
  loadingDiv.innerHTML = `<div class="typing"><span>.</span><span>.</span><span>.</span></div>`;
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {  // <-- Updated to call the serverless function
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const reply = data.reply || "Sensei is silent...";

    // Replace typing message with actual reply
    loadingDiv.remove();
    addMessage(reply, "bot");

  } catch (err) {
    loadingDiv.remove();
    addMessage("Sensei faced an error. Try again.");
    console.error(err);
  }
}


// Button handlers
document.getElementById("send-btn").onclick = (e) => {
  animateButtonClick(e.currentTarget);
  const input = userInput.value.trim();
  if (input) {
    getGPTResponse(input);
    userInput.value = "";
  }
};

document.getElementById("concept-btn").onclick = (e) => {
  animateButtonClick(e.currentTarget);
  getGPTResponse(`Teach me an advanced JavaScript concept with:
- Description
- Use case
- Code example
- Why it's important for interviews`);
};

document.getElementById("question-btn").onclick = (e) => {
  animateButtonClick(e.currentTarget);
  getGPTResponse(`Give me 5 JavaScript interview questions:
- 1 Bronze, 2 Gold, 2 Diamond level
- Include explanation, code, concept used
- Mention company that asked it if known`);
};

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevent newline if it's a textarea
    document.getElementById("send-btn").click(); // Trigger send
  }
});

