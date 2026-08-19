const chatBox = document.querySelector(".chat-box");
const input = document.getElementById("chatInput");
const send = document.getElementById("sendBtn");

let messageHistory = [];

async function reply() {
    const text = input.value.trim();
    if (!text) return;

    // युजरको मेसेज च्याट बक्समा देखाउने
    const userMsg = document.createElement("div");
    userMsg.className = "user-msg";
    userMsg.innerHTML = `<p>${text.replace(/[<>]/g, "")}</p>`;
    chatBox.insertBefore(userMsg, document.querySelector(".typing"));
    
    messageHistory.push({ role: "user", content: text });
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // सर्भरमा मेसेज पठाउने
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messageHistory })
        });

        const data = await response.json();
        
        const botMsg = document.createElement("div");
        botMsg.className = "chat-msg bot-msg";

        if (data.answer) {
            botMsg.innerHTML = `<span class="tiny-bot">◉</span><p>${data.answer}</p>`;
            messageHistory.push({ role: "model", content: data.answer });
        } else {
            botMsg.innerHTML = `<span class="tiny-bot">◉</span><p>माफ गर्नुहोला, केही समस्या आयो ⚠️।</p>`;
        }

        chatBox.insertBefore(botMsg, document.querySelector(".typing"));
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("Error:", error);
        const errorMsg = document.createElement("div");
        errorMsg.className = "chat-msg bot-msg";
        errorMsg.innerHTML = `<span class="tiny-bot">◉</span><p>सर्भरसँग जोडिन सकिएन 🔌।</p>`;
        chatBox.insertBefore(errorMsg, document.querySelector(".typing"));
    }
}

send.addEventListener("click", reply);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") reply();
});

// Theme Toggle र अन्य फिचरहरू
document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("light");
    document.querySelector("#themeBtn span").textContent = document.body.classList.contains("light") ? "Light" : "Dark";
};

const topBtn = document.getElementById("scrollTop");
window.addEventListener("scroll", () => topBtn.style.display = scrollY > 500 ? "block" : "none");
topBtn.onclick = () => scrollTo({ top: 0, behavior: "smooth" });

document.querySelectorAll(".tabs button,.blog-tabs button").forEach(b => b.onclick = () => {
    b.parentElement.querySelectorAll("button").forEach(x => x.classList.remove("selected"));
    b.classList.add("selected");
});
