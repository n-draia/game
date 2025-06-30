// --- L'Oreal Chatbot JS ---
// OpenAI API integration (replace 'YOUR_OPENAI_API_KEY' with your actual key)
// Use a Cloudflare Worker to protect the API key
const workerURL = 'https://loreal-protection.taldav52.workers.dev/';
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
// Conversation history for chat completions
let conversationHistory = [
  {
    role: 'system',
    content:
      "You are a smart, friendly, and professional beauty advisor for LOréal. Your role is to assist users with personalized advice about skincare, haircare, makeup, and other beauty-related topics, specifically focusing on LOréal products. You help customers discover products that match their needs, preferences, and budget. You are knowledgeable about product benefits, routines, skin and hair types, and you provide clear, helpful recommendations. When users mention budget concerns, always factor affordability into your advice and suggest suitable LOréal product options across different price points. Stay polite, upbeat, and respectful. Your tone should reflect LOréals commitment to beauty, innovation, and confidence. If a user asks a question unrelated to LOréal, its products, or general beauty advice, kindly respond that you are only able to help with LOréal beauty-related topics. Never make up product names, medical claims, or recommendations outside your scope."
  }
];

chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage(message, 'user');
  userInput.value = '';
  // Add user message to conversation history
  conversationHistory.push({ role: 'user', content: message });
  appendMessage('...', 'bot');
  const botMsgDiv = chatWindow.querySelector('.bot-msg:last-child');
  try {
    // Call Cloudflare Worker endpoint to protect API key
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: conversationHistory,
        max_tokens: 150,
        temperature: 0.7,
        frequency_penalty: 0.5,
      })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error('Failed to parse API response:', jsonErr);
      botMsgDiv.innerText = 'Sorry, there was a problem understanding the chatbot response.';
      return;
    }
    const botReply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    // Add bot reply to conversation history
    conversationHistory.push({ role: 'assistant', content: botReply });
    botMsgDiv.innerText = botReply;
  } catch (err) {
    console.error('Chatbot API error:', err);
    botMsgDiv.innerText = 'Sorry, there was a problem connecting to the chatbot. Please try again later.';
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

