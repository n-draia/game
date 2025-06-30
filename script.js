// --- L'Oreal Chatbot JS ---
// OpenAI API integration (replace 'YOUR_OPENAI_API_KEY' with your actual key)
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const toggleRtlBtn = document.getElementById('toggle-rtl');

// Helper to append messages
function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'user' ? 'user-msg d-flex justify-content-end' : 'bot-msg d-flex justify-content-start';
  msgDiv.innerText = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle form submit
chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage(message, 'user');
  userInput.value = '';
  appendMessage('...', 'bot');
  const botMsgDiv = chatWindow.querySelector('.bot-msg:last-child');
  try {
    // Call OpenAI API (replace with your backend endpoint for security in production)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ***REMOVED***MlG8pIDRYSBufSvDBFFMifx1QQmq6jkjpbs2YmuUoeywdXyNLAznNvIuP32_CKsFtozW8oRbfaT3BlbkFJVUjfYH2On-ryzP-nUijm8jdMbqIzddHSUadClFLD14mzohJfnkD3jfsfsJTV2KnCJphi_0cn0A'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150
      })
    });
    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    botMsgDiv.innerText = botReply;
  } catch (err) {
    botMsgDiv.innerText = 'Error connecting to chatbot.';
  }
});

// RTL toggle
toggleRtlBtn.addEventListener('click', function() {
  const body = document.body;
  if (body.getAttribute('dir') === 'rtl') {
    body.setAttribute('dir', 'ltr');
    toggleRtlBtn.classList.remove('active');
  } else {
    body.setAttribute('dir', 'rtl');
    toggleRtlBtn.classList.add('active');
  }
});

// Optional: Detect Google Translate and auto-switch RTL if needed
const observer = new MutationObserver(() => {
  const html = document.documentElement;
  const lang = html.getAttribute('lang');
  if (lang && ['ar', 'he', 'fa', 'ur'].includes(lang)) {
    document.body.setAttribute('dir', 'rtl');
    toggleRtlBtn.classList.add('active');
  } else {
    document.body.setAttribute('dir', 'ltr');
    toggleRtlBtn.classList.remove('active');
  }
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

