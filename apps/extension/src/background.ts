export {};
declare const __API_BASE_URL__: string;

const API_BASE_URL = __API_BASE_URL__.replace(/\/$/, '');

function normalizeError(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as { error?: unknown; errors?: Array<{ msg?: unknown }> };
    if (typeof record.error === 'string') return record.error;
    if (Array.isArray(record.errors)) {
      const message = record.errors
        .map((item) => (typeof item.msg === 'string' ? item.msg : ''))
        .filter(Boolean)
        .join(', ');
      if (message) return message;
    }
  }
  return 'API request failed (' + status + ')';
}

async function apiRequest(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<unknown> {
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', 'Bearer ' + token);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(API_BASE_URL + path, {
    ...init,
    headers
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(normalizeError(data, response.status));
  }
  return data;
}

function matchesTarget(currentUrl: string, targetUrl: string): boolean {
  try {
    const current = new URL(currentUrl);
    const target = new URL(targetUrl);

    // Remove 'www.' prefix for comparison to allow cross-subdomain testing
    const currentHost = current.hostname.replace(/^www\./, '');
    const targetHost = target.hostname.replace(/^www\./, '');

    if (currentHost !== targetHost) return false;
    return true;
  } catch {
    return false;
  }
}

let creatingOffscreen: Promise<void> | null = null;
async function setupOffscreenDocument(path: string) {
  if (await chrome.offscreen.hasDocument()) return;
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.USER_MEDIA, chrome.offscreen.Reason.DISPLAY_MEDIA],
    justification: 'Recording usability test sessions'
  });
  await creatingOffscreen;
  creatingOffscreen = null;
}

chrome.runtime.onMessageExternal.addListener(
  (request, _sender, sendResponse) => {
    if (request.type !== 'SYNC_AUTH') return;

    const token = request.token;
    if (typeof token !== 'string' || token.length < 20) {
      sendResponse({ success: false, error: 'Invalid token payload.' });
      return;
    }

    void apiRequest('/auth/me', token)
      .then(async () => {
        await chrome.storage.local.set({ authToken: token });
        sendResponse({ success: true });
      })
      .catch((error: Error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
);

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'GET_AUTH_TOKEN') {
    void chrome.storage.local.get(['authToken']).then((result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  if (request.type === 'FETCH_ACTIVE_JOB') {
    void chrome.storage.local.get(['authToken']).then(async (result) => {
      if (!result.authToken) {
        sendResponse({ job: null, error: 'Extension is not authenticated.' });
        return;
      }

      try {
        const jobs = await apiRequest('/jobs/my', result.authToken) as Array<{
          id: string;
          status: string;
          campaign: { targetUrl: string, scenario?: string };
        }>;

        const activeJob = jobs.find(
          (job) =>
            job.status === 'CLAIMED' &&
            typeof request.currentUrl === 'string' &&
            matchesTarget(request.currentUrl, job.campaign.targetUrl)
        );

        sendResponse({ job: activeJob || null });
      } catch (error) {
        sendResponse({
          job: null,
          error: error instanceof Error ? error.message : 'Failed to load active job.'
        });
      }
    });
    return true;
  }


  
  if (request.type === 'START_RECORDING') {
    void (async () => {
      try {
        await setupOffscreenDocument('offscreen.html');
        const response = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'START_RECORDING' });
        sendResponse(response);
      } catch (e) {
        sendResponse({ error: e instanceof Error ? e.message : 'Failed to start recording' });
      }
    })();
    return true;
  }
  
  if (request.type === 'STOP_RECORDING') {
    void (async () => {
      try {
        const { authToken } = await chrome.storage.local.get(['authToken']);
        const response = await chrome.runtime.sendMessage({
          target: 'offscreen', 
          type: 'STOP_RECORDING', 
          jobId: request.jobId, 
          taskId: request.taskId, 
          token: authToken 
        });
        sendResponse(response);
      } catch (e) {
        sendResponse({ error: e instanceof Error ? e.message : 'Failed to stop recording' });
      }
    })();
    return true;
  }
  
  if (request.type === 'RETAKE_RECORDING') {
    void (async () => {
      try {
        const response = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'RETAKE_RECORDING' });
        sendResponse(response);
      } catch (e) {
        sendResponse({ error: e instanceof Error ? e.message : 'Failed to retake' });
      }
    })();
    return true;
  }

  if (request.type === 'UPLOAD_PROGRESS') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, request).catch(() => {});
        }
      });
    });
    return false;
  }

  
  if (request.type === 'ABORT_UPLOAD') {
    chrome.runtime.sendMessage({ type: 'ABORT_UPLOAD' });
    sendResponse({ success: true });
    // return false because it's sync
  }

  if (request.type === 'UPLOAD_PROGRESS') {
    // Relay to content scripts
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
});
