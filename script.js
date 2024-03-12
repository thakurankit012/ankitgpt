const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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"; // go to the openai.com then click on the API section then create a key then paste the key in double quotation mark in this line  

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
                          <p> Just type your thoughts, questions, or ideas, and let the magic unfold..<br> 🌟 Get ready for an extraordinary chat experience that adapts to your style...</p>
                      </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const getChatResponse = async (incomingChatDiv) => {
  const API_URL = "https://api.openai.com/v1/completions";
  const pElement = document.createElement("p");

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: userText,
      max_tokens: 2048,
      temperature: 0.2,
      n: 1,
      stop: null
    })
  };

  try {
    const response = await (await fetch(API_URL, requestOptions)).json();
    pElement.textContent = response.choices[0].text.trim();
  } catch (error) {
    pElement.classList.add("error");
    pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

const showTypingAnimation = () => {
  const html = `<div class="chat-content">
                  <div class="chat-details">
                      <img src="images/chatbot.jpg" alt="chatbot-img">
                      <div class="typing-animation">
                          <div class="typing-dot" style="--delay: 0.2s"></div>
                          <div class="typing-dot" style="--delay: 0.3s"></div>
                          <div class="typing-dot" style="--delay: 0.4s"></div>
                      </div>
                  </div>
                  <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
              </div>`;
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  const html = `<div class="chat-content">
                  <div class="chat-details">
                      <img src="images/user.jpg" alt="user-img">
                      <p>${userText}</p>
                  </div>
              </div>`;

  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(() => showTypingAnimation(outgoingChatDiv), 500);
  addDownArrow(outgoingChatDiv);
};

const addDownArrow = (outgoingChatDiv) => {
  const downArrow = document.createElement("div");
  downArrow.className = "down-arrow";
  downArrow.innerHTML = "&#x2193;"; 
  outgoingChatDiv.appendChild(downArrow);

  downArrow.addEventListener("click", () => {
    removeChatElement(outgoingChatDiv);
  });
};

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${initialInputHeight}px`;
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

// ankit thakur 
// email - thakurankit13197@gmail.com
// now hope this web will work and if this didn't work. I am surely gonna do changes in my code and make it better 


