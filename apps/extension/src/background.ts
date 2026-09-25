// Listen for messages from the Web Application via externally_connectable
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'SYNC_AUTH') {
      const token = request.token;

      // Store token in Extension storage
      chrome.storage.local.set({ authToken: token }, () => {
        console.log('Token synchronized successfully from Web App.');
        sendResponse({ success: true });
      });

      // Keep message channel open for async sendResponse
      return true;
    }
  }
);

// Listen for messages from Content Scripts or Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AUTH_TOKEN') {
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true; // async
  }
});