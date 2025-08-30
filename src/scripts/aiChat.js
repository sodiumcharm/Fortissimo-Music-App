import { chatWithSia, windowManager } from "./serverConnection.js";
import { chatTextMaker } from "./utilities.js";

const aiChatSendBtn = document.querySelector(".ai-send-chat");
const aiMicBtn = document.querySelector(".ai-mic-btn");
const chatInput = document.getElementById("ai-chat-input");
const siaBtn = document.querySelector('.sia-btn');

export const initAIChat = function () {
  siaBtn.addEventListener('click', function() {
    windowManager('.ai-chat', 'show');
  });

  aiChatSendBtn.addEventListener("click", async function () {
    const message = chatInput.value;

    if (message.trim() === "") return;

    chatTextMaker("user", message);

    const successful = await chatWithSia(message);

    if (!successful) return;

    chatInput.value = "";
  });

  aiMicBtn.addEventListener("click", function () {
    const speechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (speechRecognition) {
      const recognition = new speechRecognition();

      recognition.lang = "en-IN";

      recognition.interimResults = false;

      recognition.maxAlternatives = 1;

      recognition.start();

      this.classList.add("listening");
      chatInput.placeholder = "Listening";

      recognition.onresult = function (e) {
        const transcript = e.results[0][0].transcript;

        chatInput.value = transcript;
      };

      recognition.onerror = function () {
        aiMicBtn.classList.remove("listening");
        chatInput.placeholder = "Something went wrong!";
      };

      recognition.onend = function () {
        aiMicBtn.classList.remove("listening");
        chatInput.placeholder = "Ask something";
      };
    }
  });
};
