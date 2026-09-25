// Simple UI Overlay for testing tasks
function injectOverlay() {
  if (document.getElementById('usability-testing-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'usability-testing-overlay';
  overlay.style.position = 'fixed';
  overlay.style.bottom = '20px';
  overlay.style.right = '20px';
  overlay.style.width = '300px';
  overlay.style.backgroundColor = 'white';
  overlay.style.border = '2px solid #2563eb';
  overlay.style.borderRadius = '8px';
  overlay.style.padding = '16px';
  overlay.style.zIndex = '999999';
  overlay.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
  overlay.style.fontFamily = 'system-ui, sans-serif';

  const title = document.createElement('h3');
  title.innerText = 'Current Task:';
  title.style.margin = '0 0 8px 0';
  title.style.fontSize = '16px';

  const instruction = document.createElement('p');
  instruction.innerText = 'Example: Find the pricing page and describe what you see.';
  instruction.style.margin = '0 0 16px 0';
  instruction.style.fontSize = '14px';

  const submitBtn = document.createElement('button');
  submitBtn.innerText = 'Complete Task';
  submitBtn.style.backgroundColor = '#2563eb';
  submitBtn.style.color = 'white';
  submitBtn.style.border = 'none';
  submitBtn.style.padding = '8px 16px';
  submitBtn.style.borderRadius = '4px';
  submitBtn.style.cursor = 'pointer';
  submitBtn.style.width = '100%';

  submitBtn.onclick = () => {
    alert('Task submission payload would be sent to the API here, using the JWT token.');
  };

  overlay.appendChild(title);
  overlay.appendChild(instruction);
  overlay.appendChild(submitBtn);

  document.body.appendChild(overlay);
}

// Check if we have an active job (in real app, we fetch from API using our token)
chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, (response) => {
  if (response && response.token) {
    // We are authenticated. For MVP, we'll just inject the overlay to demonstrate it works.
    injectOverlay();
  }
});