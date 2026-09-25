// Listen for messages from the Web Application via externally_connectable
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'SYNC_AUTH') {
      const token = request.token;

      chrome.storage.local.set({ authToken: token }, () => {
        console.log('Token synchronized successfully from Web App.');
        sendResponse({ success: true });
      });
      return true;
    }
  }
);

// Listen for messages from Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AUTH_TOKEN') {
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  if (request.type === 'FETCH_ACTIVE_JOB') {
    chrome.storage.local.get(['authToken'], (result) => {
      if (!result.authToken) return sendResponse({ job: null });

      fetch('http://localhost:4000/jobs/my', {
        headers: { 'Authorization': `Bearer ${result.authToken}` }
      })
      .then(res => res.json())
      .then(jobs => {
        const activeJob = jobs.find((j: any) => j.status === 'CLAIMED');
        sendResponse({ job: activeJob || null });
      })
      .catch(() => sendResponse({ job: null }));
    });
    return true;
  }

  if (request.type === 'SUBMIT_JOB') {
    chrome.storage.local.get(['authToken'], (result) => {
      fetch(`http://localhost:4000/jobs/${request.jobId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${result.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses: request.responses })
      })
      .then(res => res.json())
      .then(data => sendResponse({ success: !data.error, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    });
    return true;
  }
});