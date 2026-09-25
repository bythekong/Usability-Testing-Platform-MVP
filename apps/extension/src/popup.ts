document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const userInfoEl = document.getElementById('user-info');

  chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, (response) => {
    if (response && response.token) {
      if (statusEl) statusEl.innerText = 'Authenticated (Ready to test)';
      if (userInfoEl) userInfoEl.innerText = `Token length: ${response.token.length}`;
      if (statusEl) statusEl.style.color = 'green';
    } else {
      if (statusEl) statusEl.innerText = 'Not Authenticated';
      if (userInfoEl) userInfoEl.innerText = 'Please log in on the Web Dashboard.';
      if (statusEl) statusEl.style.color = 'red';
    }
  });
});