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

    if (current.origin !== target.origin) return false;

    const targetPath = target.pathname.endsWith('/')
      ? target.pathname
      : target.pathname + '/';

    return (
      current.pathname === target.pathname ||
      current.pathname.startsWith(targetPath)
    );
  } catch {
    return false;
  }
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
          campaign: { targetUrl: string };
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

  if (request.type === 'SUBMIT_JOB') {
    void chrome.storage.local.get(['authToken']).then(async (result) => {
      if (!result.authToken) {
        sendResponse({ success: false, error: 'Extension is not authenticated.' });
        return;
      }

      try {
        const data = await apiRequest(
          '/jobs/' + request.jobId + '/submit',
          result.authToken,
          {
            method: 'POST',
            body: JSON.stringify({ responses: request.responses })
          }
        );
        sendResponse({ success: true, data });
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Submission failed.'
        });
      }
    });
    return true;
  }
});
