const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// 1. Initialize an array to hold the entire conversation history.
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // 2. Add the new user message to our history.
  conversationHistory.push({
    role: 'user',
    message: userMessage,
  });

  // Show a temporary "Thinking..." message and get a reference to it
  const thinkingMsgElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 3. Send the complete conversation history to the backend.
      body: JSON.stringify({
        conversation: [
          {
            role: 'user',
            message: userMessage,
          },
        ],
        conversation: conversationHistory,
      }),
    });

    if (!response.ok) {
      // Handle HTTP errors like 404, 500
      thinkingMsgElement.textContent = 'Failed to get response from server.';
      // 5. On error, remove the last user message to keep history consistent.
      conversationHistory.pop();
      return;
    }

    const result = await response.json();

    if (result.success && result.data) {
      const aiMessage = result.data;
      // Update the "Thinking..." message with the actual response
      thinkingMsgElement.textContent = result.data;
      thinkingMsgElement.textContent = aiMessage;
      
      // 4. Add the AI's response to our history for the next turn.
      conversationHistory.push({
        role: 'model',
        message: aiMessage,
      });
    } else {
      // Handle cases where the API returns success: false or no data
      thinkingMsgElement.textContent = result.message || 'Sorry, no response received.';
      // 5. On error, remove the last user message.
      conversationHistory.pop();
    }
  } catch (error) {
    // Handle network errors or JSON parsing errors
    console.error('Error fetching chat response:', error);
    thinkingMsgElement.textContent = 'Failed to get response from server.';
    // 5. On error, remove the last user message.
    conversationHistory.pop();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  // Return the message element so it can be modified later
  return msg;
}
