const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Show a temporary "Thinking..." message and get a reference to it
  const thinkingMsgElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: [
          {
            role: 'user',
            message: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      // Handle HTTP errors like 404, 500
      thinkingMsgElement.textContent = 'Failed to get response from server.';
      return;
    }

    const result = await response.json();

    if (result.success && result.data) {
      // Update the "Thinking..." message with the actual response
      thinkingMsgElement.textContent = result.data;
    } else {
      // Handle cases where the API returns success: false or no data
      thinkingMsgElement.textContent = result.message || 'Sorry, no response received.';
    }
  } catch (error) {
    // Handle network errors or JSON parsing errors
    console.error('Error fetching chat response:', error);
    thinkingMsgElement.textContent = 'Failed to get response from server.';
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
