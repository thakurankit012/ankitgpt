const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "AIzaSyB0yofhOSFizrHfxrjevP4DtStcrKXLJ6w"; // Replace with your actual API key
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const initialInputHeight = chatInput.scrollHeight;

const fadeInOut = (element, isFadeIn) => {
  let opacity = isFadeIn ? 0 : 1;
  const increment = isFadeIn ? 0.1 : -0.1;

  element.style.opacity = opacity;

  const interval = setInterval(() => {
    if ((isFadeIn && opacity < 1) || (!isFadeIn && opacity > 0)) {
      opacity += increment;
      element.style.opacity = opacity;
    } else {
      clearInterval(interval);
      if (!isFadeIn) {
        element.remove();
      }
    }
  }, 50);
};

const createChatElement = (content, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  fadeInOut(chatDiv, true);
  return chatDiv;
};

const removeChatElement = (element) => {
  fadeInOut(element, false);
};

const loadDataFromLocalstorage = () => {
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  const defaultText = `<div class="default-text opening-animation">
                          <h1>AnkitGPT</h1>
                          <p>Just type your thoughts, questions, or ideas, and let the magic unfold..<br> &#x2605; Get ready for an extraordinary chat experience that adapts to your style...</p>
                      </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const getChatResponse = async (userText) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userText }] }]
      })
    });

    const data = await response.json();
    let chatResponse = data.candidates[0].content.parts[0].text;

    if (userText.toLowerCase().includes("code") || userText.toLowerCase().includes("bash")) {
      chatResponse = `\`\`\`bash\n${chatResponse}\n\`\`\``;
    }

    return chatResponse;
  } catch (error) {
    console.error("API error:", error);
    return "Error: API request failed";
  }
};

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};


const showTypingAnimation = () => {
  getChatResponse(userText).then((response) => {
    let contentClass = "chat-content"; 
    
    if (response.startsWith("```bash") && response.endsWith("```")) {
      contentClass = "bash-code"; 
      response = response.replace(/^```bash/, "").replace(/```$/, ""); 
    } else if (response.startsWith("```") && response.endsWith("```")) {
      contentClass = "code-block"; 
      response = response.replace(/^```/, "").replace(/```$/, ""); 
    }

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="chatbot.jpg" alt="chatbot-img">
                        <pre class="${contentClass}">${response}</pre> <!-- Apply dynamic class here -->
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        <span class="chat-time">${getCurrentTime()}</span> <!-- Time displayed here -->
                    </div>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  });
};



const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = "";
  chatInput.style.height = "auto";

  const html = `<div class="chat-content">
                  <div class="chat-details">
                      <img src="user.jpg" alt="user-img">
                      <p>${userText}</p>
                      <span class="chat-time">${getCurrentTime()}</span> <!-- Time displayed here -->
                  </div>
              </div>`;

  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
};


deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);

