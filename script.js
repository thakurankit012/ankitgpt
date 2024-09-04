const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "AIzaSyDhXi6Ermx2S7aXFd9jggmEj5sbOL24eWI"; // Replace with your actual API key
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

  const defaultText = `<div class="default-text opening-animation" >
                          <h1>AnkitGPT</h1>
                          <p> Just type your thoughts, questions, or ideas, and let the magic unfold..<br> &#x2605; Get ready for an extraordinary chat experience that adapts to your style...</p>
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
    return data.candidates[0].content.parts[0].text;
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

const showTypingAnimation = () => {
  getChatResponse(userText).then((response) => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <a href="https://ibb.co/Lv4txRX"><img src="https://i.ibb.co/GFg2Wp4/chatbot.jpg" alt="chatbot" border="0"></a>
                        <p>${response}</p>
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
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
                      <a href="https://imgbb.com/"><img src="https://i.ibb.co/d67jwJ0/user.jpg" alt="user" border="0"></a>
                      <p>${userText}</p>
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
