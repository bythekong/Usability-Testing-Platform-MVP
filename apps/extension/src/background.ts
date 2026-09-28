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

// ──────────────────────────────────────────────
//  Session Management (replaces URL matching)
// ──────────────────────────────────────────────

interface ActiveSession {
  jobId: string;
  currentTaskIndex: number;
  taskState: 'READY' | 'RECORDING' | 'UPLOADING';
  completedTaskIds: string[];
  campaign: {
    targetUrl: string;
    scenario?: string;
    tasks: Array<{
      id: string;
      stepOrder: number;
      instruction: string;
      maxTimeLimit: number;
      taskType: string;
      taskUrl: string | null;
      choices: string[];
      ratingMin: number | null;
      ratingMax: number | null;
      ratingMinLabel: string | null;
      ratingMaxLabel: string | null;
    }>;
  };
}

async function getSession(): Promise<ActiveSession | null> {
  const result = await chrome.storage.local.get(['activeSession']);
  return result.activeSession || null;
}

async function setSession(session: ActiveSession | null): Promise<void> {
  if (session) {
    await chrome.storage.local.set({ activeSession: session });
  } else {
    await chrome.storage.local.remove('activeSession');
  }
}

// ──────────────────────────────────────────────
//  Offscreen document
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
//  External Messages (from Web Dashboard)
// ──────────────────────────────────────────────

chrome.runtime.onMessageExternal.addListener(
  (request, _sender, sendResponse) => {
    console.log('RECEIVED EXTERNAL MESSAGE:', request.type);

    if (request.type === 'SYNC_AUTH') {
      const token = request.token;
      if (typeof token !== 'string' || token.length < 20) {
        console.log('INVALID TOKEN:', token);
        sendResponse({ success: false, error: 'Invalid token payload.' });
        return;
      }

      console.log('FETCHING API WITH TOKEN...');
      void apiRequest('/auth/me', token)
        .then(async (user) => {
          console.log('API SUCCESS:', user);
          await chrome.storage.local.set({ authToken: token });
          sendResponse({ success: true });
        })
        .catch((error: Error) => {
          sendResponse({ success: false, error: error.message });
        });

      return true;
    }

    // New: START_SESSION — web dashboard sends full job data to start a session
    if (request.type === 'START_SESSION') {
      const { job } = request;
      if (!job || !job.id || !job.campaign) {
        sendResponse({ success: false, error: 'Invalid job data.' });
        return;
      }

      void (async () => {
        try {
          const completedTaskIds = Array.isArray(request.completedTaskIds) ? request.completedTaskIds : [];
          
          // Sort tasks by stepOrder
          const tasks = [...job.campaign.tasks].sort(
            (a: { stepOrder: number }, b: { stepOrder: number }) => a.stepOrder - b.stepOrder
          );

          // Find first incomplete task
          let startIndex = tasks.findIndex((t: any) => !completedTaskIds.includes(t.id));
          if (startIndex === -1) startIndex = 0; // If all completed, just show first (or let finish screen show)

          const session: ActiveSession = {
            jobId: job.id,
            currentTaskIndex: startIndex,
            taskState: 'READY',
            completedTaskIds,
            campaign: {
              targetUrl: job.campaign.targetUrl,
              scenario: job.campaign.scenario,
              tasks,
            },
          };

          await setSession(session);
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: (e as Error).message });
        }
      })();

      return true;
    }

    // New: END_SESSION — web dashboard asks to clear session
    if (request.type === 'END_SESSION') {
      void setSession(null).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }
  }
);

// ──────────────────────────────────────────────
//  Internal Messages (from Content Script / Offscreen)
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('SW: RECEIVED INTERNAL MESSAGE:', request.type);

  if (request.type === 'GET_AUTH_TOKEN') {
    void chrome.storage.local.get(['authToken']).then((result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  // New: GET_SESSION — content script asks for active session
  if (request.type === 'GET_SESSION') {
    void getSession().then((session) => {
      sendResponse({ session });
    });
    return true;
  }

  // New: UPDATE_SESSION — content script updates session state
  if (request.type === 'UPDATE_SESSION') {
    void (async () => {
      const session = await getSession();
      if (!session) {
        sendResponse({ success: false, error: 'No active session' });
        return;
      }
      // Merge updates
      if (request.currentTaskIndex !== undefined) session.currentTaskIndex = request.currentTaskIndex;
      if (request.taskState !== undefined) session.taskState = request.taskState;
      if (request.completedTaskIds !== undefined) session.completedTaskIds = request.completedTaskIds;
      await setSession(session);
      sendResponse({ success: true });
    })();
    return true;
  }

  // Legacy: FETCH_ACTIVE_JOB — still supported for backward compat, 
  // but now also writes session to storage if found
  if (request.type === 'FETCH_ACTIVE_JOB') {
    void (async () => {
      // First check if there's already an active session
      const existingSession = await getSession();
      if (existingSession) {
        // Return the session as a job for backward compat
        sendResponse({ job: { id: existingSession.jobId, campaign: existingSession.campaign } });
        return;
      }

      // Fall back to API fetch
      const { authToken } = await chrome.storage.local.get(['authToken']);
      if (!authToken) {
        sendResponse({ job: null, error: 'Extension is not authenticated.' });
        return;
      }

      try {
        const jobs = await apiRequest('/jobs/my', authToken) as Array<{
          id: string;
          status: string;
          campaign: { targetUrl: string, scenario?: string, tasks: unknown[] };
        }>;

        const activeJob = jobs.find((job) => job.status === 'CLAIMED');

        if (activeJob) {
          // Write session so content scripts on any domain can pick it up
          const tasks = (activeJob.campaign.tasks as ActiveSession['campaign']['tasks']).sort(
            (a, b) => a.stepOrder - b.stepOrder
          );
          const session: ActiveSession = {
            jobId: activeJob.id,
            currentTaskIndex: 0,
            taskState: 'READY',
            completedTaskIds: [],
            campaign: {
              targetUrl: activeJob.campaign.targetUrl,
              scenario: activeJob.campaign.scenario,
              tasks,
            },
          };
          await setSession(session);
        }

        sendResponse({ job: activeJob || null });
      } catch (error) {
        sendResponse({
          job: null,
          error: error instanceof Error ? error.message : 'Failed to load active job.'
        });
      }
    })();
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
          token: authToken,
          structuredAnswer: request.structuredAnswer ?? null,
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
});
