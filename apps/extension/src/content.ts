import { marked } from 'marked';

interface ActiveTask {
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
}

interface ActiveSession {
  jobId: string;
  currentTaskIndex: number;
  taskState: 'READY' | 'RECORDING' | 'UPLOADING';
  completedTaskIds: string[];
  campaign: {
    targetUrl: string;
    scenario?: string;
    tasks: ActiveTask[];
  };
}

let session: ActiveSession | null = null;

// Tracks the in-session structured answer for current task (locked on submit)
let currentStructuredAnswer: { type: string; value: string | number } | null = null;

let timerInterval: ReturnType<typeof setInterval> | null = null;
let remainingTime = 0;

// ──────────────────────────────────────────────
//  Bootstrap: Read session from storage
// ──────────────────────────────────────────────

function bootstrap() {
  chrome.runtime.sendMessage({ type: 'GET_SESSION' }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('CONTENT: No extension connection', chrome.runtime.lastError);
      return;
    }

    if (response?.session) {
      session = response.session;
      console.log('CONTENT: Active session found', session!.jobId);
      injectWelcomeModal();
      injectOverlay();
    } else {
      console.log('CONTENT: No active session');
    }
  });
}

// ──────────────────────────────────────────────
//  Session sync helpers
// ──────────────────────────────────────────────

function updateSession(updates: Partial<Pick<ActiveSession, 'currentTaskIndex' | 'taskState' | 'completedTaskIds'>>) {
  if (!session) return;
  if (updates.currentTaskIndex !== undefined) session.currentTaskIndex = updates.currentTaskIndex;
  if (updates.taskState !== undefined) session.taskState = updates.taskState;
  if (updates.completedTaskIds !== undefined) session.completedTaskIds = updates.completedTaskIds;
  chrome.runtime.sendMessage({ type: 'UPDATE_SESSION', ...updates });
}

function getCurrentTask(): ActiveTask | null {
  if (!session || session.currentTaskIndex >= session.campaign.tasks.length) return null;
  return session.campaign.tasks[session.currentTaskIndex];
}

// ──────────────────────────────────────────────
//  Welcome Modal
// ──────────────────────────────────────────────

function injectWelcomeModal() {
  if (!session || document.getElementById('ut-welcome-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'ut-welcome-modal';
  Object.assign(modal.style, {
    position: 'fixed', inset: '0',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: '9999999', fontFamily: 'system-ui, sans-serif', opacity: '1'
  });

  const content = document.createElement('div');
  Object.assign(content.style, {
    backgroundColor: 'white', padding: '32px', borderRadius: '12px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', opacity: '1'
  });

  const scenarioText = session.campaign.scenario || 'Please follow the instructions on the bottom right to complete the test.';
  const htmlScenario = marked.parse(scenarioText) as string;

  content.innerHTML = `
    <h2 style="margin-top:0; color:#111827; font-size:24px;">Welcome to this Usability Test</h2>
    <div style="margin:24px 0; color:#374151; font-size:16px; line-height:1.5;">${htmlScenario}</div>
    <button id="ut-understand-btn" style="width:100%; background-color:#2563eb !important; color:white !important; border:none !important; padding:12px !important; border-radius:8px !important; cursor:pointer !important; font-weight:bold !important; font-size:16px !important; opacity: 1 !important;">I Understand &amp; Continue</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('ut-understand-btn')!.onclick = () => {
    modal.style.display = 'none';
  };
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function getTaskTypeBadge(taskType: string): string {
  if (taskType === 'MULTIPLE_CHOICE') return '☑️ Multiple Choice';
  if (taskType === 'RATING_SCALE') return '⭐ Rating Scale';
  return '🎙️ Free Response';
}

// ──────────────────────────────────────────────
//  Answer UI (MC / Rating) during recording
// ──────────────────────────────────────────────

function renderAnswerUI(task: ActiveTask): string {
  if (session?.taskState !== 'RECORDING') return '';

  if (task.taskType === 'MULTIPLE_CHOICE' && task.choices.length > 0) {
    const choicesHtml = task.choices.map((choice, i) => `
      <label style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:6px; border:2px solid #e5e7eb; cursor:pointer; font-size:13px; background:white; margin-bottom:6px; transition:border-color 0.15s;"
        id="ut-choice-label-${i}">
        <input type="radio" name="ut-mc-choice" value="${escapeHtml(choice)}" 
          style="accent-color:#2563eb; cursor:pointer;"
          onchange="window.__utSelectChoice(${i}, '${escapeJs(choice)}')"
        />
        <span style="color:#1f2937; font-weight:500;">${escapeHtml(choice)}</span>
      </label>
    `).join('');

    return `
      <div id="ut-answer-ui" style="margin-bottom:10px;">
        <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280; margin-bottom:8px;">Select your answer:</p>
        <div id="ut-choices">${choicesHtml}</div>
        <p id="ut-answer-status" style="font-size:11px; color:#dc2626; margin-top:4px;"></p>
      </div>
    `;
  }

  if (task.taskType === 'RATING_SCALE') {
    const min = task.ratingMin ?? 1;
    const max = task.ratingMax ?? 5;
    const buttons = Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => `
      <button type="button" id="ut-rating-${n}"
        onclick="window.__utSelectRating(${n})"
        style="width:34px; height:34px; border-radius:50%; border:2px solid #d1d5db; background:white; cursor:pointer; font-size:13px; font-weight:bold; color:#374151; transition:all 0.15s; flex-shrink:0;"
      >${n}</button>
    `).join('');

    return `
      <div id="ut-answer-ui" style="margin-bottom:10px;">
        <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280; margin-bottom:8px;">Select your rating:</p>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${task.ratingMinLabel ? `<span style="font-size:11px; color:#6b7280;">${escapeHtml(task.ratingMinLabel)}</span>` : ''}
          ${buttons}
          ${task.ratingMaxLabel ? `<span style="font-size:11px; color:#6b7280;">${escapeHtml(task.ratingMaxLabel)}</span>` : ''}
        </div>
        <p id="ut-answer-status" style="font-size:11px; color:#dc2626; margin-top:4px;"></p>
      </div>
    `;
  }

  return '';
}

// ──────────────────────────────────────────────
//  Task Transition Screen
// ──────────────────────────────────────────────

function showTransitionScreen(nextTask: ActiveTask, nextIndex: number) {
  const overlay = document.getElementById('usability-testing-overlay');
  if (!overlay) return;

  const nextUrl = nextTask.taskUrl || session!.campaign.targetUrl;
  const hasNewUrl = !!nextTask.taskUrl;

  overlay.innerHTML = `
    <div style="text-align:center; padding:8px 0;">
      <div style="font-size:24px; margin-bottom:8px;">✅</div>
      <h3 style="margin:0 0 12px 0; font-size:16px; font-weight:bold; color:#16a34a;">Task Complete!</h3>
      
      <div style="text-align:left; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px;">
        <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280; margin:0 0 4px 0;">Next: Task ${nextIndex + 1} of ${session!.campaign.tasks.length}</p>
        <p style="font-size:11px; color:#6b7280; margin:0 0 6px 0;">${getTaskTypeBadge(nextTask.taskType || 'FREE_RESPONSE')}</p>
        <p style="font-size:14px; font-weight:600; color:#111827; margin:0;">${escapeHtml(nextTask.instruction)}</p>
        ${hasNewUrl ? `
          <div style="margin-top:8px; padding:8px; background:#eff6ff; border-radius:6px; border:1px solid #bfdbfe;">
            <p style="font-size:11px; color:#2563eb; margin:0;">🔗 This task uses a different URL:</p>
            <p style="font-size:12px; color:#1d4ed8; font-weight:500; margin:4px 0 0 0; word-break:break-all;">${escapeHtml(nextUrl)}</p>
          </div>
        ` : ''}
      </div>
      
      <button id="ut-go-next-btn" style="width:100%; background-color:#2563eb !important; color:white !important; border:none !important; padding:10px !important; border-radius:6px !important; cursor:pointer !important; font-weight:bold !important; font-size:14px !important; opacity:1 !important;">
        ${hasNewUrl ? 'Go to Next Task →' : 'Continue to Next Task →'}
      </button>
    </div>
  `;

  document.getElementById('ut-go-next-btn')!.onclick = () => {
    if (hasNewUrl) {
      // Navigate to the new URL — content script on new page will pick up session
      window.location.href = nextUrl;
    } else {
      // Stay on same page, rebuild overlay
      rebuildOverlay();
    }
  };
}

// ──────────────────────────────────────────────
//  Finish Screen
// ──────────────────────────────────────────────

function showFinishScreen() {
  const overlay = document.getElementById('usability-testing-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div style="text-align:center; padding:8px 0;">
      <div style="font-size:32px; margin-bottom:8px;">🎉</div>
      <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:bold; color:#16a34a;">All Tasks Complete!</h3>
      <p style="font-size:14px; color:#374151; margin:0 0 16px 0;">Please return to the Usability Hub dashboard to write your final review and submit.</p>
      <button id="ut-end-session-btn" style="width:100%; background-color:#6b7280 !important; color:white !important; border:none !important; padding:10px !important; border-radius:6px !important; cursor:pointer !important; font-weight:bold !important; font-size:14px !important; opacity:1 !important;">Close Panel</button>
    </div>
  `;

  document.getElementById('ut-end-session-btn')!.onclick = () => {
    // Clear session — overlay won't appear on next page load
    chrome.runtime.sendMessage({ type: 'UPDATE_SESSION', taskState: 'READY' });
    const container = document.getElementById('usability-testing-overlay-container');
    if (container) container.remove();
  };
}

// ──────────────────────────────────────────────
//  Overlay (main panel)
// ──────────────────────────────────────────────

function rebuildOverlay() {
  // Remove old overlay and re-inject
  const old = document.getElementById('usability-testing-overlay-container');
  if (old) old.remove();
  injectOverlay();
}

function injectOverlay() {
  if (!session || document.getElementById('usability-testing-overlay')) return;

  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'usability-testing-overlay-container';
  Object.assign(overlayContainer.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', opacity: '1'
  });

  const minBtn = document.createElement('button');
  minBtn.id = 'ut-minimized-btn';
  Object.assign(minBtn.style, {
    width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2563eb',
    color: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    cursor: 'pointer', display: 'none', justifyContent: 'center', alignItems: 'center',
    fontSize: '24px', fontWeight: 'bold', transition: 'transform 0.2s', padding: '0', opacity: '1'
  });
  minBtn.innerHTML = '📋';
  minBtn.title = 'Open Usability Test Panel';

  const overlay = document.createElement('div');
  overlay.id = 'usability-testing-overlay';
  Object.assign(overlay.style, {
    width: '360px', backgroundColor: 'white', border: '2px solid #2563eb', borderRadius: '8px',
    padding: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: '#1f2937', display: 'block', opacity: '1'
  });

  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937 !important;">Active Usability Test</h3>
      <div style="display: flex; gap: 8px;">
        <button id="ut-view-brief-btn" style="background: none !important; border: none !important; color: #2563eb !important; font-size: 12px !important; cursor: pointer !important; text-decoration: underline !important; opacity: 1 !important; padding: 0 !important; font-weight: normal !important;">📖 Brief</button>
        <button id="ut-minimize-btn" style="background: none !important; border: none !important; color: #6b7280 !important; font-size: 14px !important; cursor: pointer !important; padding: 0 4px !important; opacity: 1 !important; font-weight: normal !important;" title="Minimize">_</button>
      </div>
    </div>
    <div id="ut-progress-text" style="font-size: 12px; margin-bottom: 4px; color: #6b7280 !important;"></div>
    <div id="ut-task-type-badge" style="font-size: 11px; font-weight: 600; margin-bottom: 8px; color: #6b7280;"></div>
    <p id="ut-instruction" style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1f2937 !important;"></p>
    <div id="ut-task-url-hint" style="display:none; margin-bottom:8px; padding:6px 8px; background:#eff6ff; border-radius:4px; border:1px solid #bfdbfe; font-size:11px; color:#2563eb;"></div>
    <div id="ut-timer" style="margin-bottom: 12px; font-size: 18px; font-weight: bold; color: #dc2626 !important; display: none;"></div>
    
    <div id="ut-answer-ui-container" style="margin-bottom: 4px;"></div>

    <div id="ut-upload-container" style="display: none; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 12px; font-weight: bold; color: #1f2937 !important;">Uploading Video... <span id="ut-upload-percent">0</span>%</span>
        <button id="ut-cancel-btn" style="background: none !important; border: none !important; cursor: pointer !important; color: #dc2626 !important; font-weight: bold !important; opacity: 1 !important; padding: 0 !important;">✕</button>
      </div>
      <div style="width: 100%; background-color: #e5e7eb !important; border-radius: 4px; height: 8px;">
        <div id="ut-upload-bar" style="width: 0%; background-color: #2563eb !important; height: 100%; border-radius: 4px; transition: width 0.2s;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; gap: 8px;">
      <button id="ut-start-btn" style="flex: 1; background-color: #2563eb !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Start Task</button>
      <button id="ut-retake-btn" style="flex: 1; background-color: #ef4444 !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; display: none; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Retake</button>
      <button id="ut-submit-btn" style="flex: 1; background-color: #16a34a !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; display: none; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Submit Task</button>
    </div>
  `;

  overlayContainer.appendChild(minBtn);
  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer);

  // Global handlers for dynamic answer elements
  (window as any).__utSelectChoice = (idx: number, value: string) => {
    currentStructuredAnswer = { type: 'MULTIPLE_CHOICE', value };
    document.querySelectorAll('[id^="ut-choice-label-"]').forEach((el, i) => {
      const label = el as HTMLElement;
      label.style.borderColor = i === idx ? '#2563eb' : '#e5e7eb';
      label.style.backgroundColor = i === idx ? '#eff6ff' : 'white';
    });
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = '';
  };

  (window as any).__utSelectRating = (value: number) => {
    currentStructuredAnswer = { type: 'RATING_SCALE', value };
    const task = getCurrentTask();
    if (!task) return;
    const min = task.ratingMin ?? 1;
    const max = task.ratingMax ?? 5;
    Array.from({ length: max - min + 1 }, (_, i) => min + i).forEach(n => {
      const btn = document.getElementById(`ut-rating-${n}`) as HTMLButtonElement | null;
      if (btn) {
        btn.style.borderColor = n === value ? '#2563eb' : '#d1d5db';
        btn.style.backgroundColor = n === value ? '#2563eb' : 'white';
        btn.style.color = n === value ? 'white' : '#374151';
      }
    });
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = '';
  };

  // Panel controls
  document.getElementById('ut-minimize-btn')!.onclick = () => {
    overlay.style.display = 'none';
    minBtn.style.display = 'flex';
  };
  minBtn.onclick = () => {
    minBtn.style.display = 'none';
    overlay.style.display = 'block';
  };

  document.getElementById('ut-start-btn')!.onclick = startTask;
  document.getElementById('ut-retake-btn')!.onclick = retakeTask;
  document.getElementById('ut-submit-btn')!.onclick = submitTask;
  document.getElementById('ut-cancel-btn')!.onclick = cancelUpload;

  const briefBtn = document.getElementById('ut-view-brief-btn');
  if (briefBtn) {
    briefBtn.onclick = () => {
      let modal = document.getElementById('ut-welcome-modal');
      if (modal) {
        modal.style.display = 'flex';
      } else {
        injectWelcomeModal();
      }
    };
  }

  renderTask();
}

// ──────────────────────────────────────────────
//  Render current task state
// ──────────────────────────────────────────────

function renderTask() {
  if (!session) return;

  const tasks = session.campaign.tasks;
  const isFinished = session.currentTaskIndex >= tasks.length;

  if (isFinished) {
    showFinishScreen();
    return;
  }

  const activeTask = tasks[session.currentTaskIndex];
  const taskState = session.taskState;

  document.getElementById('ut-instruction')!.innerText = 'Task ' + (session.currentTaskIndex + 1) + ': ' + activeTask.instruction;
  document.getElementById('ut-progress-text')!.innerText = 'Task ' + (session.currentTaskIndex + 1) + ' of ' + tasks.length;
  document.getElementById('ut-task-type-badge')!.innerText = getTaskTypeBadge(activeTask.taskType || 'FREE_RESPONSE');

  // Show task-specific URL hint
  const urlHint = document.getElementById('ut-task-url-hint')!;
  if (activeTask.taskUrl) {
    urlHint.style.display = 'block';
    urlHint.innerText = '🔗 This task uses: ' + activeTask.taskUrl;
  } else {
    urlHint.style.display = 'none';
  }

  document.getElementById('ut-start-btn')!.style.display = taskState === 'READY' ? 'block' : 'none';
  document.getElementById('ut-retake-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-submit-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  
  document.getElementById('ut-timer')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-upload-container')!.style.display = taskState === 'UPLOADING' ? 'block' : 'none';

  // Render dynamic answer UI (MC/Rating) when recording
  document.getElementById('ut-answer-ui-container')!.innerHTML = renderAnswerUI(activeTask);
}

// ──────────────────────────────────────────────
//  Timer
// ──────────────────────────────────────────────

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const timerEl = document.getElementById('ut-timer')!;
  
  const updateDisplay = () => {
    const m = Math.floor(remainingTime / 60);
    const s = remainingTime % 60;
    timerEl.innerText = `${m}:${s.toString().padStart(2, '0')}`;
  };

  updateDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval!);
      submitTask();
    }
  }, 1000);
}

// ──────────────────────────────────────────────
//  Task Actions
// ──────────────────────────────────────────────

function startTask() {
  if (!session || session.taskState !== 'READY') return;
  
  chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (response) => {
    if (response?.error) {
      alert('Failed to start recording: ' + response.error);
      return;
    }
    const task = getCurrentTask()!;
    remainingTime = task.maxTimeLimit || 300;
    currentStructuredAnswer = null;
    updateSession({ taskState: 'RECORDING' });
    startTimer();
    renderTask();
  });
}

function retakeTask() {
  if (!session || session.taskState !== 'RECORDING') return;
  if (timerInterval) clearInterval(timerInterval);
  currentStructuredAnswer = null;
  
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
    updateSession({ taskState: 'READY' });
    renderTask();
  });
}

function submitTask() {
  if (!session || session.taskState !== 'RECORDING') return;

  const task = getCurrentTask()!;
  const taskType = task.taskType || 'FREE_RESPONSE';

  // Validate structured answer
  if (taskType === 'MULTIPLE_CHOICE' && !currentStructuredAnswer) {
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = 'Please select an answer before submitting.';
    return;
  }
  if (taskType === 'RATING_SCALE' && !currentStructuredAnswer) {
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = 'Please select a rating before submitting.';
    return;
  }

  if (timerInterval) clearInterval(timerInterval);

  updateSession({ taskState: 'UPLOADING' });
  updateProgressUI(0);
  renderTask();

  chrome.runtime.sendMessage({ 
    type: 'STOP_RECORDING',
    jobId: session.jobId,
    taskId: task.id,
    structuredAnswer: currentStructuredAnswer,
  }, (response) => {
    if (!session || session.taskState !== 'UPLOADING') return;
    
    if (response?.error) {
      alert('Upload failed: ' + response.error);
      updateSession({ taskState: 'RECORDING' });
      renderTask();
      return;
    }
    
    // Upload success — advance to next incomplete task
    currentStructuredAnswer = null;
    
    // Add current task to completed list
    const updatedCompletedIds = [...(session!.completedTaskIds || []), task.id];
    
    // Find next incomplete task
    let nextIndex = session!.campaign.tasks.findIndex((t, idx) => 
      idx > session!.currentTaskIndex && !updatedCompletedIds.includes(t.id)
    );

    // If not found after current, loop from beginning (for retakes)
    if (nextIndex === -1) {
      nextIndex = session!.campaign.tasks.findIndex(t => !updatedCompletedIds.includes(t.id));
    }

    if (nextIndex === -1) {
      // All tasks done
      updateSession({ currentTaskIndex: session.campaign.tasks.length, taskState: 'READY', completedTaskIds: updatedCompletedIds });
      showFinishScreen();
    } else {
      // Show transition screen
      updateSession({ currentTaskIndex: nextIndex, taskState: 'READY', completedTaskIds: updatedCompletedIds });
      const nextTask = session.campaign.tasks[nextIndex];
      showTransitionScreen(nextTask, nextIndex);
    }
  });
}

function cancelUpload() {
  if (!session || session.taskState !== 'UPLOADING') return;
  chrome.runtime.sendMessage({ type: 'ABORT_UPLOAD' });
  
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
    currentStructuredAnswer = null;
    updateSession({ taskState: 'READY' });
    renderTask();
  });
}

function updateProgressUI(percent: number) {
  const percentEl = document.getElementById('ut-upload-percent');
  const barEl = document.getElementById('ut-upload-bar');
  if (percentEl) percentEl.innerText = percent.toString();
  if (barEl) barEl.style.width = percent + '%';
}

// ──────────────────────────────────────────────
//  Incoming messages
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'UPLOAD_PROGRESS' && session?.taskState === 'UPLOADING') {
    updateProgressUI(request.percent);
  }
});

// ──────────────────────────────────────────────
//  Start
// ──────────────────────────────────────────────

bootstrap();
